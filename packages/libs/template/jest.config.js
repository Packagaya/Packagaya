module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['**/*.test.ts'],
    setupFiles: ['./src/setup-jest.ts'],
};
