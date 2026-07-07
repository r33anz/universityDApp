import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { buildStudent } from '../helpers/factories.js';

vi.mock('../../src/application/useCases/kardex/UseCaseKardexRequest.js', () => ({
  default: { uploadingKardexToIPFS: vi.fn() },
}));

vi.mock('../../src/application/services/StudentService.js', () => ({
  default: { verifyStudentInDB: vi.fn() },
}));

vi.mock('../../src/application/services/NotificationService.js', () => ({
  default: { studentAskedKardex: vi.fn() },
}));

vi.mock('../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: { contract: { on: vi.fn() } },
}));

vi.mock('../../src/infrastructure/ipfs/ipfsConnection.js', () => ({
  default: { client: null, initialize: vi.fn(), uploadFile: vi.fn() },
}));

vi.mock('../../src/infrastructure/db/dbConnection.js', () => ({
  default: { sync: vi.fn(), authenticate: vi.fn(), define: vi.fn() },
}));

vi.mock('../../src/infrastructure/db/models/student.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/notification.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/globalplan.js', () => ({ default: {} }));

const { app } = await import('../../src/app.js');
const { default: UseCase } =
  await import('../../src/application/useCases/kardex/UseCaseKardexRequest.js');
const { default: StudentService } =
  await import('../../src/application/services/StudentService.js');
const { default: NotificationService } =
  await import('../../src/application/services/NotificationService.js');

const PDF_BYTES = Buffer.from('%PDF-1.4 fake pdf body');

describe('POST /api/upload_multiple_pdfs', () => {
  beforeEach(() => vi.clearAllMocks());

  // IM-13 FIXED: removed `new` from `KardexError.fileUploadRequired()` call.
  // Now returns the intended 400 with errorCode FILE_UPLOAD_REQUIRED.
  it('400 when no files are attached (FILE_UPLOAD_REQUIRED)', async () => {
    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .field('sisCode', '202012345');

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('FILE_UPLOAD_REQUIRED');
  });

  it('400 when sisCode is missing in body', async () => {
    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .attach('files', PDF_BYTES, 'a.pdf');

    expect(res.status).toBe(400);
  });

  it('BR-K3: 404 STUDENT_NOT_FOUND when student does not exist', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .field('sisCode', '000')
      .field('careers', 'Sistemas')
      .field('subject', 'Programacion I')
      .attach('files', PDF_BYTES, 'a.pdf');

    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('STUDENT_NOT_FOUND');
  });

  it('BR-K4: 400 when student has no pending request (notification not in IN_PROCESS)', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(buildStudent());
    NotificationService.studentAskedKardex.mockResolvedValue(false);
    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .field('sisCode', '202012345')
      .field('careers', 'Sistemas')
      .field('subject', 'Programacion I')
      .attach('files', PDF_BYTES, 'a.pdf');

    expect(res.status).toBe(400);
  });

  it('201 success when useCase resolves true', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(buildStudent());
    NotificationService.studentAskedKardex.mockResolvedValue(true);
    UseCase.uploadingKardexToIPFS.mockResolvedValue({ success: true });

    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .field('sisCode', '202012345')
      .field('careers', 'Sistemas')
      .field('subject', 'Programacion I')
      .attach('files', PDF_BYTES, 'a.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('BR-K1: rejects non-PDF mime types at multer layer', async () => {
    const res = await request(app)
      .post('/api/upload_multiple_pdfs')
      .field('sisCode', '202012345')
      .attach('files', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' });

    // multer's fileFilter rejects; the request is malformed downstream
    expect([400, 500]).toContain(res.status);
  });
});
