import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      mode === 'production' && dts({
        staticImport: true,
        entryRoot: './src',
        outputDir: './dist'
      })
    ]
  }
})
