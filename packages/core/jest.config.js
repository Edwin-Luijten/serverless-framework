/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: ".coverage",
    collectCoverageFrom: ["./src/**", "!./src/index.ts"],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {tsconfig: './tsconfig.test.json'},
        ],
    },
};