import { describe, it, expect } from 'vitest';
import { createURINFTTemplate } from '../../../src/interface/uriNFTtemplate/URINFTTemplate.js';

describe('createURINFTTemplate', () => {
  const SIS = '202012345';
  const CID = 'QmFakeDirCid';

  it('returns the complete NFT metadata shape', () => {
    const meta = createURINFTTemplate(SIS, CID);

    expect(meta.name).toBe(`Kardex Estudiantil-${SIS}`);
    expect(meta.student_sis_code).toBe(SIS);
    expect(meta.university).toContain('San Simon');
    expect(meta.document_type).toBe('Academic Transcript');
    expect(meta.files).toEqual({
      directory_cid: CID,
      access_url: `http://localhost:8080/ipfs/${CID}`,
    });
  });

  it('includes the 4 required ERC-721 attributes', () => {
    const meta = createURINFTTemplate(SIS, CID);
    const traits = meta.attributes.map((a) => a.trait_type);
    expect(traits).toEqual(['University', 'Issue Date', 'SIS Code', 'Document Type']);
  });

  it('image URL points to the default kardex IPFS image', () => {
    const meta = createURINFTTemplate(SIS, CID);
    expect(meta.image).toBe('http://localhost:8080/ipfs/QmTestImage');
  });

  it('issue_date is a valid ISO-8601 timestamp', () => {
    const meta = createURINFTTemplate(SIS, CID);
    expect(() => new Date(meta.issue_date).toISOString()).not.toThrow();
  });
});
