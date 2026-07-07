import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPdfFile } from '../../helpers/factories.js';

const makeMfsApi = () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn(),
  cp: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn(),
});

vi.mock('../../../src/infrastructure/ipfs/ipfsConnection.js', () => {
  return {
    default: {
      client: null,
      uploadFile: vi.fn(),
      initialize: vi.fn(),
    },
  };
});

const { default: IpfsService } = await import('../../../src/application/services/IpfsService.js');
const { default: ipfsConnection } = await import('../../../src/infrastructure/ipfs/ipfsConnection.js');

describe('IpfsService.uploadMultiplePdfs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ipfsConnection.client = {
      add: vi.fn().mockResolvedValue({ cid: { toString: () => 'QmFakeCid' } }),
      files: makeMfsApi(),
    };
    ipfsConnection.client.files.stat.mockResolvedValue({ cid: { toString: () => 'QmRootCid' } });
  });

  it('throws KardexError IPFS_CONNECTION_ERROR when the client is not initialized', async () => {
    ipfsConnection.client = null;
    await expect(IpfsService.uploadMultiplePdfs([buildPdfFile()])).rejects.toMatchObject({
      errorCode: 'IPFS_CONNECTION_ERROR',
      statusCode: 500,
    });
  });

  it('throws NO_FILES_PROVIDED when called with an empty list', async () => {
    await expect(IpfsService.uploadMultiplePdfs([])).rejects.toMatchObject({
      errorCode: 'NO_FILES_PROVIDED',
    });
  });

  it('happy path: adds each file, copies to MFS and returns dirCid + ipfsLink', async () => {
    const result = await IpfsService.uploadMultiplePdfs([buildPdfFile()], true);

    expect(ipfsConnection.client.files.mkdir).toHaveBeenCalled();
    expect(ipfsConnection.client.add).toHaveBeenCalled();
    expect(ipfsConnection.client.files.cp).toHaveBeenCalled();
    expect(result).toMatchObject({
      success: true,
      dirCid: 'QmRootCid',
      ipfsLink: expect.stringContaining('QmRootCid'),
    });
    expect(result.files).toHaveLength(1);
  });

  it('overwrite=false appends a unique _Date.now() suffix to filename (documents IM-9)', async () => {
    const file = buildPdfFile({ filename: 'kardex.pdf' });
    // Simulate "file does not exist" so the stat-check branch falls through.
    ipfsConnection.client.files.stat
      .mockRejectedValueOnce(new Error('file does not exist'))
      .mockResolvedValue({ cid: { toString: () => 'QmRootCid' } });

    const result = await IpfsService.uploadMultiplePdfs([file], false);
    expect(result.files[0].filename).toMatch(/^kardex_\d+\.pdf$/);
  });

  it('overwrite=true uses the filename as-is and does not attempt the stat-collision check', async () => {
    const file = buildPdfFile({ filename: 'kardex.pdf' });
    const result = await IpfsService.uploadMultiplePdfs([file], true);
    expect(result.files[0].filename).toBe('kardex.pdf');
  });
});

describe('IpfsService.metadataJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ipfsConnection.client = { add: vi.fn() };
    ipfsConnection.uploadFile.mockResolvedValue('QmMetaCid');
  });

  it('serializes metadata as a JSON Blob and returns the resulting CID', async () => {
    const cid = await IpfsService.metadataJSON({ foo: 'bar' });
    expect(ipfsConnection.uploadFile).toHaveBeenCalledTimes(1);
    expect(cid).toBe('QmMetaCid');
  });

  it('throws IPFS_METADATA_ERROR when uploadFile fails', async () => {
    ipfsConnection.uploadFile.mockRejectedValue(new Error('ipfs'));
    await expect(IpfsService.metadataJSON({})).rejects.toMatchObject({
      errorCode: 'IPFS_METADATA_ERROR',
    });
  });

  // BUG IM-12: metadataJSON throws IPFS_CONNECTION_ERROR *inside* the try block,
  // and the surrounding catch re-wraps it as IPFS_METADATA_ERROR. The original
  // connection-error code is lost. Test pins current behavior.
  it('IM-12: re-wraps a null-client check as IPFS_METADATA_ERROR (bug)', async () => {
    ipfsConnection.client = null;
    await expect(IpfsService.metadataJSON({})).rejects.toMatchObject({
      errorCode: 'IPFS_METADATA_ERROR',
    });
  });
});
