import { describe, it, expect } from 'vitest';
import StudentError from '../../../src/interface/error/studentErrors.js';
import KardexError from '../../../src/interface/error/kardexErrors.js';
import ContractError from '../../../src/interface/error/contractErrors.js';

describe('StudentError', () => {
  it('preserves the contract { message, statusCode, details, errorCode, name }', () => {
    const err = new StudentError('boom', 418, { foo: 1 }, 'CODE');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('boom');
    expect(err.statusCode).toBe(418);
    expect(err.details).toEqual({ foo: 1 });
    expect(err.errorCode).toBe('CODE');
    expect(err.name).toBe('StudentError');
  });

  it('defaults statusCode to 500 and details/errorCode to null', () => {
    const err = new StudentError('boom');
    expect(err.statusCode).toBe(500);
    expect(err.details).toBeNull();
    expect(err.errorCode).toBeNull();
  });

  it.each([
    ['badRequest', 400],
    ['notFound', 404],
    ['internal', 500],
    ['conflict', 409],
  ])('factory %s returns statusCode %i', (factory, expected) => {
    const err = StudentError[factory]('m', { d: 1 }, 'C');
    expect(err.statusCode).toBe(expected);
    expect(err.details).toEqual({ d: 1 });
    expect(err.errorCode).toBe('C');
  });
});

describe('KardexError', () => {
  it('honors the same constructor contract as StudentError', () => {
    const err = new KardexError('boom', 422, { x: 1 }, 'K');
    expect(err.name).toBe('KardexError');
    expect(err.statusCode).toBe(422);
    expect(err.errorCode).toBe('K');
  });

  it.each([
    ['badRequest', 400, undefined],
    ['internal', 500, undefined],
    ['notFound', 404, undefined],
    ['invalidFileFormat', 400, 'INVALID_FILE_FORMAT'],
    ['fileUploadRequired', 400, 'FILE_UPLOAD_REQUIRED'],
    ['kardexProcessingError', 500, 'KARDEX_PROCESSING_ERROR'],
  ])('factory %s returns statusCode %i with expected errorCode', (factory, status, code) => {
    const err = KardexError[factory]('m');
    expect(err.statusCode).toBe(status);
    if (code) expect(err.errorCode).toBe(code);
  });

  // IM-3 FIXED: KardexError.fileExists / ipfsRemoveError / contractError are now defined
  // with sensible status codes and default errorCodes that match how they are called
  // from IpfsService and UseCaseKardexRequest.
  it.each([
    ['fileExists', 409, 'FILE_ALREADY_EXISTS'],
    ['ipfsRemoveError', 500, 'IPFS_REMOVE_ERROR'],
    ['contractError', 500, 'CONTRACT_ERROR'],
  ])('KardexError.%s returns statusCode %i with default errorCode %s', (factory, status, code) => {
    const err = KardexError[factory]('msg');
    expect(err).toBeInstanceOf(KardexError);
    expect(err.statusCode).toBe(status);
    expect(err.errorCode).toBe(code);
  });

  it.each(['fileExists', 'ipfsRemoveError', 'contractError'])(
    'KardexError.%s accepts an explicit errorCode override',
    (factory) => {
      const err = KardexError[factory]('m', { x: 1 }, 'CUSTOM_CODE');
      expect(err.errorCode).toBe('CUSTOM_CODE');
      expect(err.details).toEqual({ x: 1 });
    }
  );
});

describe('StudentError.invalidInput (IM-11 fixed)', () => {
  it('returns a 400 StudentError with the provided errorCode', () => {
    const err = StudentError.invalidInput('bad wallet', { walletAddress: 'x' }, 'INVALID_WALLET_ADDRESS');
    expect(err).toBeInstanceOf(StudentError);
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('INVALID_WALLET_ADDRESS');
    expect(err.details).toEqual({ walletAddress: 'x' });
  });
});

describe('ContractError', () => {
  it('sets isContractError flag and standard fields', () => {
    const err = new ContractError('boom', 'CODE', { foo: 1 });
    expect(err.isContractError).toBe(true);
    expect(err.name).toBe('ContractError');
    expect(err.errorCode).toBe('CODE');
    expect(err.details).toEqual({ foo: 1 });
  });

  it('static transactionReverted wraps reason and tx hash', () => {
    const err = ContractError.transactionReverted('revert reason', '0xhash');
    expect(err.errorCode).toBe('TX_REVERTED');
    expect(err.message).toContain('revert reason');
    expect(err.details).toEqual({ transactionHash: '0xhash' });
  });

  it('static insufficientFunds wraps requiredGas', () => {
    const err = ContractError.insufficientFunds('21000');
    expect(err.errorCode).toBe('INSUFFICIENT_FUNDS');
    expect(err.details).toEqual({ requiredGas: '21000' });
  });
});
