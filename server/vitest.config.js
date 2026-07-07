import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/infrastructure/db/migrations/**',
        'src/infrastructure/db/seeders/**',
        'src/infrastructure/db/models/*.js', // Sequelize model boilerplate
        'src/infrastructure/db/dbConnection.js', // singleton config
        'src/infrastructure/ipfs/ipfsConnection.js', // covered via service mocks
        'src/infrastructure/blockchain/abi/**',
        'src/index.js',
        'src/app.js',
      ],
      thresholds: {
        lines: 70,
        functions: 85,
        branches: 75,
        statements: 70,
      },
    },
    testTimeout: 10000,
  },
});
