// Factories produce realistic mock entities to keep test files terse.
// All factories accept overrides so tests can express only what they care about.

export const buildStudent = (overrides = {}) => ({
  id: 1,
  codSIS: '202012345',
  hasCredential: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const buildNotification = (overrides = {}) => ({
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Nueva peticion de kardex',
  message: 'El estudiante con codigo 202012345 solicito la subida de su kardex.',
  status: 'not_attended',
  from: '202012345',
  emittedAt: new Date('2025-03-15T10:30:00Z'),
  attendedAt: null,
  toJSON() {
    const { toJSON, ...rest } = this;
    return rest;
  },
  ...overrides,
});

export const buildGlobalPlan = (overrides = {}) => ({
  id: '22222222-2222-2222-2222-222222222222',
  materia: 'Programacion I',
  path: 'storage/base/programacion-i.pdf',
  ...overrides,
});

export const buildPdfFile = (overrides = {}) => ({
  blob: Buffer.from('%PDF-1.4 fake pdf'),
  filename: 'test.pdf',
  path: '/202012345/Sistemas/',
  career: 'Sistemas',
  subject: 'Programacion I',
  sisCode: '202012345',
  ...overrides,
});

export const buildTxReceipt = (overrides = {}) => ({
  status: 1,
  transactionHash: '0xabc',
  ...overrides,
});

// Builds a fake ethers Tx whose .wait() resolves to a receipt.
export const buildTx = (receiptOverrides = {}) => ({
  wait: async () => buildTxReceipt(receiptOverrides),
});

export const buildContractError = (code, extra = {}) => {
  const err = new Error(`Simulated ${code}`);
  err.code = code;
  Object.assign(err, extra);
  return err;
};
