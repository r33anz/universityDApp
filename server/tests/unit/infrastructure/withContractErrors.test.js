import { describe, it, expect, vi } from 'vitest';
import { withContractErrors, awaitReceipt } from '../../../src/infrastructure/blockchain/contracts/withContractErrors.js';
import ContractError from '../../../src/interface/error/contractErrors.js';

describe('withContractErrors', () => {
  it('returns the inner function result on success', async () => {
    const result = await withContractErrors('op', async () => 'ok');
    expect(result).toBe('ok');
  });

  it('passes ContractError through without re-wrapping', async () => {
    const original = ContractError.transactionReverted('reason', '0xhash');
    await expect(withContractErrors('op', async () => { throw original; }))
      .rejects.toBe(original);
  });

  it.each([
    ['CALL_EXCEPTION',     { reason: 'r', method: 'm', args: [1] }],
    ['INSUFFICIENT_FUNDS', { requiredGas: '21000' }],
    ['NETWORK_ERROR',      {}],
  ])('maps ethers code %s to a ContractError with matching errorCode', async (code, _details) => {
    const err = Object.assign(new Error('chain'), { code, reason: 'r', method: 'm', args: [1], error: { gas: '21000' } });
    await expect(withContractErrors('emitCredential', async () => { throw err; }))
      .rejects.toMatchObject({
        errorCode: code,
        statusCode: 500,
        isContractError: true,
      });
  });

  it('maps unknown error codes to UNKNOWN_CONTRACT_ERROR with the original message', async () => {
    const err = new Error('mystery');
    await expect(withContractErrors('op', async () => { throw err; }))
      .rejects.toMatchObject({
        errorCode: 'UNKNOWN_CONTRACT_ERROR',
        details: { originalError: 'mystery' },
      });
  });

  it('prefixes the operation name into the message', async () => {
    const err = Object.assign(new Error('x'), { code: 'CALL_EXCEPTION' });
    await expect(withContractErrors('emitCredential', async () => { throw err; }))
      .rejects.toThrow(/emitCredential/);
  });
});

describe('awaitReceipt', () => {
  it('returns the receipt when status === 1', async () => {
    const tx = { wait: async () => ({ status: 1, transactionHash: '0xa' }) };
    const r = await awaitReceipt(tx);
    expect(r.status).toBe(1);
  });

  it('throws TX_REVERTED when status === 0', async () => {
    const tx = { wait: async () => ({ status: 0, transactionHash: '0xb' }) };
    await expect(awaitReceipt(tx)).rejects.toMatchObject({
      errorCode: 'TX_REVERTED',
      details: { transactionHash: '0xb' },
    });
  });
});
