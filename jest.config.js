module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['**/*.test.ts'],
    setupFiles: ['./setup-jest.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.base.json',
        },
    },
};
