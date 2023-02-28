/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleDirectories: ['node_modules', 'src'],
    collectCoverage: true,
    coverageDirectory: ".coverage",
    collectCoverageFrom: ["./src/**", "!./src/index.ts"],
};