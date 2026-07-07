/**
 * Single source of truth for environment configuration.
 *
 * - Loads .env once (replacing the 4 scattered dotenv.config() calls).
 * - Validates that all required variables are present BEFORE any adapter
 *   tries to use them — fail-fast with a clear list of what's missing.
 * - Exports a structured object namespaced by domain (http, db, blockchain,
 *   ipfs, mail) so each adapter consumes only the slice it needs and so
 *   secrets are never accidentally leaked via `...process.env`.
 *
 * Lives under `infrastructure/` because env vars are an external concern,
 * just like the database driver or the RPC provider.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

dotenv.config({ path: path.join(projectRoot, '.env') });

const env = process.env;
const isTest = env.NODE_ENV === 'test';

const REQUIRED = [
    'PRIVATE_KEY',
    'CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL',
    'CONTRACT_ADDRESS_NFT',
    'DB_HOST',
    'DB_USER',
    'DB_PASS',
    'DB_NAME',
    'IPFS_API',
    'IPFS_GATEWAY',
    'EMAIL_USER',
    'EMAIL_PASS',
];

if (!isTest) {
    const missing = REQUIRED.filter((k) => !env[k]);
    if (missing.length) {
        throw new Error(
            `[config] Faltan variables de entorno obligatorias: ${missing.join(', ')}.\n` +
            `Copia .env.example a .env y completa los valores.`
        );
    }
}

const config = {
    env: env.NODE_ENV || 'development',
    isTest,
    isDevelopment: env.NODE_ENV !== 'production' && !isTest,

    http: {
        port: Number(env.PORT) || 5000,
        corsOrigin: env.CORS_ORIGIN || '*',
    },

    db: {
        host: env.DB_HOST,
        port: Number(env.DB_PORT) || 5432,
        user: env.DB_USER,
        password: env.DB_PASS,
        name: env.DB_NAME,
        dialect: 'postgres',
    },

    blockchain: {
        rpcUrl: env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        privateKey: env.PRIVATE_KEY,
        contractCredentialManagement: env.CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL,
        contractNFT: env.CONTRACT_ADDRESS_NFT,
        scannerBaseUrl: env.SCANNER_BASE_URL || 'https://testnet.bscscan.com',
        scannerApiKey: env.BSCSCAN_API_KEY,
    },

    ipfs: {
        apiUrl: env.IPFS_API,
        gatewayUrl: env.IPFS_GATEWAY,
        defaultKardexImage: env.IPFS_DEFAULT_KARDEX_IMAGE,
    },

    mail: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
        adminRecipient: env.ADMIN_EMAIL || 'rodrigo33newton@gmail.com',
    },
};

export default config;
