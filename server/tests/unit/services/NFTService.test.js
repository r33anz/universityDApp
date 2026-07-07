import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/infrastructure/blockchain/contracts/NFTContract.js', () => ({
  default: {
    mintStudentKardex: vi.fn(),
    updateProgress: vi.fn(),
    hasKardex: vi.fn(),
  },
}));

vi.mock('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: {
    getAddress: vi.fn(),
  },
}));

vi.mock('../../../src/application/services/IpfsService.js', () => ({
  default: {
    metadataJSON: vi.fn(),
  },
}));

const { default: NFTService } = await import('../../../src/application/services/NFTService.js');
const { default: NFTContract } = await import('../../../src/infrastructure/blockchain/contracts/NFTContract.js');
const { default: CredentialManagement } =
  await import('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js');
const { default: IpfsService } = await import('../../../src/application/services/IpfsService.js');

describe('NFTService.manageNFT', () => {
  beforeEach(() => vi.clearAllMocks());

  it('BR-K9: mints a new NFT when the student has NO previous kardex', async () => {
    CredentialManagement.getAddress.mockResolvedValue('0xstudent');
    IpfsService.metadataJSON.mockResolvedValue('QmMetaCid');
    NFTContract.hasKardex.mockResolvedValue(false);

    const result = await NFTService.manageNFT('202012345', 'QmDirCid');

    expect(NFTContract.mintStudentKardex).toHaveBeenCalledWith(
      '0xstudent',
      '202012345',
      'QmDirCid',
      'ipfs://QmMetaCid'
    );
    expect(NFTContract.updateProgress).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('BR-K10: calls updateProgress with the gateway URL when student HAS a kardex', async () => {
    CredentialManagement.getAddress.mockResolvedValue('0xstudent');
    IpfsService.metadataJSON.mockResolvedValue('QmMetaCid');
    NFTContract.hasKardex.mockResolvedValue(true);

    await NFTService.manageNFT('202012345', 'QmDirCid');

    expect(NFTContract.updateProgress).toHaveBeenCalledWith(
      '0xstudent',
      'QmDirCid',
      'http://localhost:8080/ipfs/QmMetaCid'
    );
    expect(NFTContract.mintStudentKardex).not.toHaveBeenCalled();
  });

  it('wraps and re-throws errors with a "Failed to manage NFT" message', async () => {
    CredentialManagement.getAddress.mockResolvedValue('0xstudent');
    IpfsService.metadataJSON.mockResolvedValue('QmMetaCid');
    NFTContract.hasKardex.mockResolvedValue(false);
    NFTContract.mintStudentKardex.mockRejectedValue(new Error('chain'));

    await expect(NFTService.manageNFT('s', 'c')).rejects.toThrow(/Failed to manage NFT/);
  });
});

describe('NFTService.hasKardex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forwards to the contract and returns its boolean', async () => {
    NFTContract.hasKardex.mockResolvedValue(true);
    const result = await NFTService.hasKardex('0xstudent');
    expect(NFTContract.hasKardex).toHaveBeenCalledWith('0xstudent');
    expect(result).toBe(true);
  });

  it('wraps errors with "Failed to check kardex"', async () => {
    NFTContract.hasKardex.mockRejectedValue(new Error('chain'));
    await expect(NFTService.hasKardex('0x')).rejects.toThrow(/Failed to check kardex/);
  });
});
