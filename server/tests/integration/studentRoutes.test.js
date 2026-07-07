import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the useCase BEFORE importing the app (the controller's singleton captures it on import).
vi.mock('../../src/application/useCases/studentCredential/UseCaseEmitStudentCredential.js', () => ({
  default: {
    emitCredential: vi.fn(),
    verifyByWallet: vi.fn(),
  },
}));

// studentStatus uses StudentService directly (no useCase indirection).
vi.mock('../../src/application/services/StudentService.js', () => ({
  default: { verifyStudentInDB: vi.fn() },
}));

// Neutralize the blockchain listener that app.js fires on import.
// ListenBlockchainEvent.listening() reads CredentialManagement.contract.on(...).
vi.mock('../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: { contract: { on: vi.fn() } },
}));

// Neutralize the IPFS connection so the singleton is benign.
vi.mock('../../src/infrastructure/ipfs/ipfsConnection.js', () => ({
  default: { client: null, initialize: vi.fn(), uploadFile: vi.fn() },
}));

// Neutralize sequelize so dbConnection.js doesn't try to dial Postgres.
vi.mock('../../src/infrastructure/db/dbConnection.js', () => ({
  default: { sync: vi.fn(), authenticate: vi.fn(), define: vi.fn() },
}));

// Short-circuit model files: app.js transitively imports them via the other
// routes (NotificationController, PdfController) and Model.init() would NPE
// against the fake sequelize above. The models are never USED by these tests.
vi.mock('../../src/infrastructure/db/models/student.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/notification.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/globalplan.js', () => ({ default: {} }));

const { app } = await import('../../src/app.js');
const { default: UseCase } =
  await import('../../src/application/useCases/studentCredential/UseCaseEmitStudentCredential.js');
const { default: StudentService } =
  await import('../../src/application/services/StudentService.js');

describe('POST /api/verify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('400 when SISCode missing', async () => {
    const res = await request(app).post('/api/verify').send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
  });

  it('200 + payload on success', async () => {
    UseCase.emitCredential.mockResolvedValue({
      id: 7, codSIS: '202012345', mnemonic: 'word '.repeat(12).trim(),
    });
    const res = await request(app).post('/api/verify').send({ SISCode: '202012345' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, codSIS: '202012345' });
    expect(typeof res.body.mnemonic).toBe('string');
  });

  it('404 when useCase throws STUDENT_NOT_FOUND', async () => {
    const err = new Error('not found');
    err.name = 'StudentError';
    err.statusCode = 404;
    err.errorCode = 'STUDENT_NOT_FOUND';
    Object.setPrototypeOf(err, (await import('../../src/interface/error/studentErrors.js')).default.prototype);
    UseCase.emitCredential.mockRejectedValue(err);

    const res = await request(app).post('/api/verify').send({ SISCode: '000' });
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('STUDENT_NOT_FOUND');
  });

  it('500 when useCase throws an unknown error', async () => {
    UseCase.emitCredential.mockRejectedValue(new Error('boom'));
    const res = await request(app).post('/api/verify').send({ SISCode: '202012345' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/verify-wallet/:walletAddress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('200 with isValid:true when useCase resolves', async () => {
    UseCase.verifyByWallet.mockResolvedValue({
      isValid: true, walletAddress: '0xabc', sisCode: '202012345',
    });
    const res = await request(app).get('/api/verify-wallet/0xabc');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: { isValid: true, sisCode: '202012345' },
    });
  });

  it('400 when useCase throws INVALID_WALLET_ADDRESS', async () => {
    const StudentError = (await import('../../src/interface/error/studentErrors.js')).default;
    UseCase.verifyByWallet.mockRejectedValue(
      new StudentError('bad', 400, null, 'INVALID_WALLET_ADDRESS')
    );
    const res = await request(app).get('/api/verify-wallet/garbage');
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_WALLET_ADDRESS');
  });
});

describe('GET /api/students/:sisCode/status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns exists:false when the student is not in the DB', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(null);
    const res = await request(app).get('/api/students/000/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: false, hasCredential: false });
  });

  it('returns exists:true, hasCredential:true when Sequelize gives boolean true', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue({ codSIS: '202012345', hasCredential: true });
    const res = await request(app).get('/api/students/202012345/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true, hasCredential: true });
  });

  it("accepts the VARCHAR-coerced string 'true' shape as well", async () => {
    StudentService.verifyStudentInDB.mockResolvedValue({ codSIS: '202012345', hasCredential: 'true' });
    const res = await request(app).get('/api/students/202012345/status');
    expect(res.body).toEqual({ exists: true, hasCredential: true });
  });

  it('returns hasCredential:false when the student exists but lacks credential', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue({ codSIS: '202012345', hasCredential: false });
    const res = await request(app).get('/api/students/202012345/status');
    expect(res.body).toEqual({ exists: true, hasCredential: false });
  });
});
