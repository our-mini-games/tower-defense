import { defineConfig, loadEnv } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)

  return {
    base: env.VITE_APP_PATHNAME,
    plugins: [
      mode === 'production' && dts({
        staticImport: true,
        entryRoot: './src',
        outputDir: './dist'
      })
    ]
  }
})
