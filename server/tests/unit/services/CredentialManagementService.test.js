import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: {
    emitCredential: vi.fn(),
    setIPFSHash: vi.fn(),
    getAddress: vi.fn(),
    markKardexAsDelivered: vi.fn(),
    verifyWalletToSIS: vi.fn(),
  },
}));

vi.mock('../../../src/application/services/StudentService.js', () => ({
  default: {
    assignedCredential: vi.fn(),
  },
}));

vi.mock('../../../src/infrastructure/blockchain/blockchainConnection.js', () => ({
  default: {
    sendTransaction: vi.fn(async () => ({ wait: async () => ({ status: 1 }) })),
    provider: { network: { name: 'bsc-testnet' } },
  },
}));

const { default: CredentialManagementService } =
  await import('../../../src/application/services/CredentialManagementService.js');
const { default: CredentialManagement } =
  await import('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js');
const { default: StudentService } =
  await import('../../../src/application/services/StudentService.js');
const { default: wallet } =
  await import('../../../src/infrastructure/blockchain/blockchainConnection.js');

describe('CredentialManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('emitCredential — happy path', () => {
    it('generates wallet, calls contract, marks credential, allocates ETH and returns mnemonic', async () => {
      CredentialManagement.emitCredential.mockResolvedValue(true);

      const result = await CredentialManagementService.emitCredential('202012345');

      expect(CredentialManagement.emitCredential).toHaveBeenCalledTimes(1);
      const [sis, address] = CredentialManagement.emitCredential.mock.calls[0];
      expect(sis).toBe('202012345');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);

      expect(StudentService.assignedCredential).toHaveBeenCalledWith('202012345');
      expect(wallet.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ to: address })
      );

      expect(typeof result.mnemonic).toBe('string');
      expect(result.mnemonic.split(' ').length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('emitCredential — error propagation (IM-1 fixed)', () => {
    // The empty catch{} that swallowed errors was removed. The service now
    // propagates blockchain failures so the calling useCase can wrap them as
    // CREDENTIAL_EMISSION_ERROR.
    it('propagates the underlying error when contract.emitCredential throws', async () => {
      CredentialManagement.emitCredential.mockRejectedValue(new Error('chain down'));

      await expect(CredentialManagementService.emitCredential('202099999'))
        .rejects.toThrow('chain down');
      expect(StudentService.assignedCredential).not.toHaveBeenCalled();
      expect(wallet.sendTransaction).not.toHaveBeenCalled();
    });

    it('still returns mnemonic and skips side-effects when tx is falsy (defensive)', async () => {
      CredentialManagement.emitCredential.mockResolvedValue(false);

      const result = await CredentialManagementService.emitCredential('202012345');

      expect(typeof result.mnemonic).toBe('string');
      expect(StudentService.assignedCredential).not.toHaveBeenCalled();
      expect(wallet.sendTransaction).not.toHaveBeenCalled();
    });
  });

  describe('allocateBalance', () => {
    it('sends 0.01 ETH to the given address and awaits the receipt', async () => {
      const receiptPromise = { wait: vi.fn().mockResolvedValue({ status: 1 }) };
      wallet.sendTransaction.mockResolvedValue(receiptPromise);

      await CredentialManagementService.allocateBalance('0xabc');

      expect(wallet.sendTransaction).toHaveBeenCalledWith({
        to: '0xabc',
        value: expect.any(BigInt), // ethers.parseEther returns BigInt
      });
      expect(receiptPromise.wait).toHaveBeenCalled();
    });
  });

  describe('getAddressBySIS', () => {
    it('forwards to the contract and returns its result', async () => {
      CredentialManagement.getAddress.mockResolvedValue('0xstudent');
      const result = await CredentialManagementService.getAddressBySIS('202012345');
      expect(CredentialManagement.getAddress).toHaveBeenCalledWith('202012345');
      expect(result).toBe('0xstudent');
    });

    it('throws a generic Error when the contract throws', async () => {
      CredentialManagement.getAddress.mockRejectedValue(new Error('chain'));
      await expect(CredentialManagementService.getAddressBySIS('x')).rejects.toThrow(
        /No se pudo obtener la dirección del estudiante/
      );
    });
  });

  describe('getSISCodeByWallet', () => {
    it('returns the SIS string on success', async () => {
      CredentialManagement.verifyWalletToSIS.mockResolvedValue('202012345');
      const result = await CredentialManagementService.getSISCodeByWallet('0xabc');
      expect(result).toBe('202012345');
    });

    it('returns null when the contract throws "El estudiante no existe"', async () => {
      const err = new Error('reverted');
      err.reason = 'El estudiante no existe';
      CredentialManagement.verifyWalletToSIS.mockRejectedValue(err);

      const result = await CredentialManagementService.getSISCodeByWallet('0xabc');
      expect(result).toBeNull();
    });

    it('re-throws any other error', async () => {
      const err = new Error('network');
      err.reason = 'something else';
      CredentialManagement.verifyWalletToSIS.mockRejectedValue(err);
      await expect(CredentialManagementService.getSISCodeByWallet('0xabc')).rejects.toThrow('network');
    });
  });
});
