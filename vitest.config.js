import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ["./src/lib/tests/**/*.{test,spec}.{js,ts}"]
  },
})