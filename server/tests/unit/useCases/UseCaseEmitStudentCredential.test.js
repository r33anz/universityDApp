import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildStudent } from '../../helpers/factories.js';

vi.mock('../../../src/application/services/StudentService.js', () => ({
  default: {
    verifyStudentInDB: vi.fn(),
    hasCredential: vi.fn(),
  },
}));

vi.mock('../../../src/application/services/CredentialManagementService.js', () => ({
  default: {
    emitCredential: vi.fn(),
    getSISCodeByWallet: vi.fn(),
    getAddressBySIS: vi.fn(),
  },
}));

const { default: UseCase } =
  await import('../../../src/application/useCases/studentCredential/UseCaseEmitStudentCredential.js');
const { default: StudentService } =
  await import('../../../src/application/services/StudentService.js');
const { default: CredentialManagementService } =
  await import('../../../src/application/services/CredentialManagementService.js');

describe('UseCaseEmitStudentCredential.emitCredential', () => {
  beforeEach(() => vi.clearAllMocks());

  it('BR-S3: throws STUDENT_NOT_FOUND when verifyStudentInDB returns null', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(null);
    await expect(UseCase.emitCredential('000')).rejects.toMatchObject({
      errorCode: 'STUDENT_NOT_FOUND',
      statusCode: 404,
    });
    expect(CredentialManagementService.emitCredential).not.toHaveBeenCalled();
  });

  it('BR-S4: throws CREDENTIAL_ALREADY_EXISTS when hasCredential is truthy', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(buildStudent());
    StudentService.hasCredential.mockResolvedValue(buildStudent({ hasCredential: true }));
    await expect(UseCase.emitCredential('202012345')).rejects.toMatchObject({
      errorCode: 'CREDENTIAL_ALREADY_EXISTS',
      statusCode: 409,
    });
  });

  it('happy path: returns { id, codSIS, mnemonic } when emission succeeds', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(buildStudent({ id: 7, codSIS: '202012345' }));
    StudentService.hasCredential.mockResolvedValue(null);
    CredentialManagementService.emitCredential.mockResolvedValue({ mnemonic: 'word '.repeat(12).trim() });

    const result = await UseCase.emitCredential('202012345');

    expect(result).toEqual({
      id: 7,
      codSIS: '202012345',
      mnemonic: expect.stringContaining('word'),
    });
  });

  it('wraps unexpected emission errors as CREDENTIAL_EMISSION_ERROR (500)', async () => {
    StudentService.verifyStudentInDB.mockResolvedValue(buildStudent());
    StudentService.hasCredential.mockResolvedValue(null);
    CredentialManagementService.emitCredential.mockRejectedValue(new Error('boom'));

    await expect(UseCase.emitCredential('202012345')).rejects.toMatchObject({
      errorCode: 'CREDENTIAL_EMISSION_ERROR',
      statusCode: 500,
    });
  });
});

describe('UseCaseEmitStudentCredential.verifyByWallet', () => {
  beforeEach(() => vi.clearAllMocks());

  // IM-11 FIXED: StudentError.invalidInput now exists; invalid wallet returns
  // the intended 400 INVALID_WALLET_ADDRESS (BR-S9).
  it('BR-S9: throws INVALID_WALLET_ADDRESS when input is not an ETH address', async () => {
    await expect(UseCase.verifyByWallet('not-an-address')).rejects.toMatchObject({
      errorCode: 'INVALID_WALLET_ADDRESS',
      statusCode: 400,
    });
  });

  it('BR-S8: returns isValid:false when contract returns empty SIS', async () => {
    CredentialManagementService.getSISCodeByWallet.mockResolvedValue('');
    const result = await UseCase.verifyByWallet('0x0000000000000000000000000000000000000000');
    expect(result).toMatchObject({ isValid: false });
  });

  it('returns isValid:true with bscscan links when SIS is found', async () => {
    CredentialManagementService.getSISCodeByWallet.mockResolvedValue('202012345');
    CredentialManagementService.getAddressBySIS.mockResolvedValue('0xabc');

    const result = await UseCase.verifyByWallet('0x0000000000000000000000000000000000000000');

    expect(result).toMatchObject({
      isValid: true,
      sisCode: '202012345',
      studentAddress: '0xabc',
    });
    expect(result.links.nftTransfers).toContain('bscscan');
  });

  it('returns isValid:false when underlying error message includes "El estudiante no existe"', async () => {
    CredentialManagementService.getSISCodeByWallet.mockRejectedValue(new Error('El estudiante no existe'));
    const result = await UseCase.verifyByWallet('0x0000000000000000000000000000000000000000');
    expect(result.isValid).toBe(false);
  });

  it('throws WALLET_VERIFICATION_ERROR for any other underlying error', async () => {
    CredentialManagementService.getSISCodeByWallet.mockRejectedValue(new Error('network'));
    await expect(UseCase.verifyByWallet('0x0000000000000000000000000000000000000000'))
      .rejects.toMatchObject({ errorCode: 'WALLET_VERIFICATION_ERROR' });
  });
});

describe('UseCaseEmitStudentCredential.isValidEthereumAddress', () => {
  it('accepts a checksum address', () => {
    expect(UseCase.isValidEthereumAddress('0x0000000000000000000000000000000000000000')).toBe(true);
  });

  it('rejects garbage', () => {
    expect(UseCase.isValidEthereumAddress('hello')).toBe(false);
  });
});
