module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: ['dist', 'templates', 'jest.config.js', 'test'],
    parserOptions: {
        tsconfigRootDir: __dirname + 'packages',
        project: ['./packages/*/tsconfig.json'],
    },
    rules: {
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-constant-condition': 'off',
    }
};