import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const runtimeEnv =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};
const repositoryName = runtimeEnv.GITHUB_REPOSITORY?.split('/')[1];
const githubPagesBase = repositoryName ? `/${repositoryName}/` : '/';

// https://vite.dev/config/
export default defineConfig({
  base: runtimeEnv.GITHUB_ACTIONS ? githubPagesBase : '/',
  plugins: [react()],
});
