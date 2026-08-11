import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  eslintConfigPrettier, // luôn để cuối
];
