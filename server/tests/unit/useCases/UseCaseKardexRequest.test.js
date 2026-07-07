import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPdfFile } from '../../helpers/factories.js';

vi.mock('../../../src/application/services/NotificationService.js', () => ({
  default: {
    saveNotification: vi.fn(),
    lastNotification: vi.fn(),
    sendNotificationToClientSide: vi.fn(),
    updateNotificationToAttended: vi.fn(),
  },
}));

vi.mock('../../../src/application/services/IpfsService.js', () => ({
  default: { uploadMultiplePdfs: vi.fn() },
}));

vi.mock('../../../src/application/services/MergeFileService.js', () => ({
  default: { processFiles: vi.fn() },
}));

vi.mock('../../../src/application/services/NFTService.js', () => ({
  default: {
    hasKardex: vi.fn(),
    manageNFT: vi.fn(),
  },
}));

vi.mock('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: {
    getAddress: vi.fn(),
    markKardexAsDelivered: vi.fn(),
  },
}));

const { default: UseCase } =
  await import('../../../src/application/useCases/kardex/UseCaseKardexRequest.js');
const { default: NotificationService } =
  await import('../../../src/application/services/NotificationService.js');
const { default: IpfsService } =
  await import('../../../src/application/services/IpfsService.js');
const { default: MergeFileService } =
  await import('../../../src/application/services/MergeFileService.js');
const { default: NFTService } =
  await import('../../../src/application/services/NFTService.js');
const { default: CredentialManagement } =
  await import('../../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js');

describe('UseCaseKardexRequest.listeningRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('persists a "Nueva peticion de kardex" notification and broadcasts via socket', async () => {
    NotificationService.lastNotification.mockResolvedValue({ id: 'n1' });
    await UseCase.listeningRequest('202012345', new Date('2025-03-15'));

    expect(NotificationService.saveNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Nueva peticion de kardex',
        body: expect.stringContaining('202012345'),
        from: '202012345',
      })
    );
    expect(NotificationService.sendNotificationToClientSide).toHaveBeenCalledWith({ id: 'n1' });
  });
});

describe('UseCaseKardexRequest.uploadingKardexToIPFS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reasonable defaults for the happy path
    CredentialManagement.getAddress.mockResolvedValue('0xstudent');
    NFTService.hasKardex.mockResolvedValue(false);
    MergeFileService.processFiles.mockResolvedValue([{
      blob: Buffer.from('m'), mergedFilename: 'x.pdf', path: '/sis/c/',
    }]);
    IpfsService.uploadMultiplePdfs.mockResolvedValue({ dirCid: 'QmDir' });
    NFTService.manageNFT.mockResolvedValue({ success: true });
    CredentialManagement.markKardexAsDelivered.mockResolvedValue(true);
  });

  it('throws when pdfList is empty', async () => {
    await expect(UseCase.uploadingKardexToIPFS([])).rejects.toMatchObject({
      errorCode: 'FILE_UPLOAD_REQUIRED',
    });
  });

  it('happy path: merges → uploads → mints → marks notification + chain delivery', async () => {
    const result = await UseCase.uploadingKardexToIPFS([buildPdfFile()]);

    expect(MergeFileService.processFiles).toHaveBeenCalled();
    expect(IpfsService.uploadMultiplePdfs).toHaveBeenCalled();
    expect(NFTService.manageNFT).toHaveBeenCalledWith('202012345', 'QmDir');
    expect(NotificationService.updateNotificationToAttended).toHaveBeenCalledWith('202012345');
    expect(CredentialManagement.markKardexAsDelivered).toHaveBeenCalledWith('202012345');
    expect(result).toEqual({ success: true });
  });

  it('IM-2 FIXED: awaits getAddress before passing the resolved address to hasKardex', async () => {
    CredentialManagement.getAddress.mockResolvedValue('0xresolvedAddress');
    await UseCase.uploadingKardexToIPFS([buildPdfFile()]);

    expect(NFTService.hasKardex).toHaveBeenCalledWith('0xresolvedAddress');
  });

  it('throws kardexProcessingError when NFTService returns success:false', async () => {
    NFTService.manageNFT.mockResolvedValue({ success: false });
    await expect(UseCase.uploadingKardexToIPFS([buildPdfFile()])).rejects.toMatchObject({
      errorCode: 'KARDEX_PROCESSING_ERROR',
    });
  });

  it('re-throws ContractError-flagged errors as KardexError wrappers preserving the inner errorCode', async () => {
    const contractErr = new Error('chain reverted');
    contractErr.isContractError = true;
    contractErr.details = { reason: 'gas' };
    contractErr.errorCode = 'TX_REVERTED';
    NFTService.manageNFT.mockRejectedValue(contractErr);

    // After IM-3 fix, KardexError.contractError exists and forwards the contract's
    // errorCode/details verbatim instead of falling through to the generic
    // KARDEX_PROCESSING_ERROR wrapper.
    await expect(UseCase.uploadingKardexToIPFS([buildPdfFile()])).rejects.toMatchObject({
      errorCode: 'TX_REVERTED',
      statusCode: 500,
      details: { reason: 'gas' },
    });
  });
});
