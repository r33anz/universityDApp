// Global test setup.
// Sets dummy env vars so infrastructure/config/env.js doesn't blow up when modules import it,
// and silences console noise to keep test output readable.

import { beforeEach, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test';
process.env.DB_PASS = 'test';
process.env.DB_NAME = 'test';
process.env.PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
process.env.CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL = '0x0000000000000000000000000000000000000001';
process.env.CONTRACT_ADDRESS_NFT = '0x0000000000000000000000000000000000000002';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test';
process.env.IPFS_API = 'http://localhost:5001';
process.env.IPFS_GATEWAY = 'http://localhost:8080/ipfs/';
process.env.IPFS_DEFAULT_KARDEX_IMAGE = 'QmTestImage';
process.env.BSCSCAN_API_KEY = 'test';

// Silence console during tests unless explicitly enabled
if (!process.env.TEST_VERBOSE) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

beforeEach(() => {
  vi.clearAllMocks();
});
