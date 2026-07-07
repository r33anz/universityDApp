import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildGlobalPlan, buildPdfFile } from '../../helpers/factories.js';

vi.mock('../../../src/infrastructure/db/models/globalplan.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('fs/promises', () => ({
  default: { readFile: vi.fn() },
  readFile: vi.fn(),
}));

// Minimal pdf-lib stub. Covers the design APIs (embedFont, drawText/Rectangle/Line,
// getSize, getPages, set* metadata) so the service code runs end-to-end. We assert
// behavior at the higher level (result shape), not pixel positions.
vi.mock('pdf-lib', () => {
  const makePage = () => ({
    drawText: vi.fn(),
    drawRectangle: vi.fn(),
    drawLine: vi.fn(),
    drawImage: vi.fn(),
    getSize: vi.fn().mockReturnValue({ width: 612, height: 792 }),
  });
  const makeFont = () => ({
    widthOfTextAtSize: vi.fn().mockReturnValue(100),
  });
  const makeImage = () => ({ width: 200, height: 200 });
  const makeDoc = () => {
    const pages = [];
    return {
      getPageIndices: () => [0],
      copyPages: vi.fn().mockResolvedValue([makePage()]),
      addPage: vi.fn().mockImplementation(() => {
        const p = makePage();
        pages.push(p);
        return p;
      }),
      getPages: vi.fn().mockImplementation(() => pages),
      embedFont: vi.fn().mockResolvedValue(makeFont()),
      embedPng: vi.fn().mockResolvedValue(makeImage()),
      embedJpg: vi.fn().mockResolvedValue(makeImage()),
      setTitle: vi.fn(),
      setAuthor: vi.fn(),
      setSubject: vi.fn(),
      setProducer: vi.fn(),
      setCreator: vi.fn(),
      save: vi.fn().mockResolvedValue(Buffer.from('%PDF merged')),
    };
  };
  return {
    PDFDocument: {
      load: vi.fn().mockImplementation(() => Promise.resolve(makeDoc())),
      create: vi.fn().mockImplementation(() => Promise.resolve(makeDoc())),
    },
    StandardFonts: {
      Helvetica:         'Helvetica',
      HelveticaBold:     'Helvetica-Bold',
      HelveticaOblique:  'Helvetica-Oblique',
    },
    rgb: vi.fn((r, g, b) => ({ r, g, b })),
  };
});

const { default: MergeFileService } =
  await import('../../../src/application/services/MergeFileService.js');
const { default: globalPlan } =
  await import('../../../src/infrastructure/db/models/globalplan.js');
const fs = (await import('fs/promises')).default;

describe('MergeFileService.processFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fs.readFile.mockResolvedValue(Buffer.from('%PDF existing'));
  });

  it('throws MISSING_SUBJECT_FIELD when a file has no .subject', async () => {
    await expect(
      MergeFileService.processFiles([buildPdfFile({ subject: undefined })])
    ).rejects.toMatchObject({ errorCode: 'MISSING_SUBJECT_FIELD' });
  });

  it('throws SUBJECT_NOT_FOUND when GlobalPlan has no matching materia', async () => {
    globalPlan.findOne.mockResolvedValue(null);
    await expect(
      MergeFileService.processFiles([buildPdfFile()])
    ).rejects.toMatchObject({ errorCode: 'SUBJECT_NOT_FOUND' });
  });

  it('throws MISSING_SUBJECT_PATH when materia exists but lacks .path', async () => {
    globalPlan.findOne.mockResolvedValue(buildGlobalPlan({ path: null }));
    await expect(
      MergeFileService.processFiles([buildPdfFile()])
    ).rejects.toMatchObject({ errorCode: 'MISSING_SUBJECT_PATH' });
  });

  it('happy path: returns merged file metadata with subject-based filename', async () => {
    globalPlan.findOne.mockResolvedValue(buildGlobalPlan());

    const result = await MergeFileService.processFiles([
      buildPdfFile({ subject: 'Programacion I' }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      originalFilename: 'test.pdf',
      mergedFilename: 'Programacion I.pdf',
      status: 'merged',
    });
    expect(Buffer.isBuffer(result[0].blob)).toBe(true);
  });
});
