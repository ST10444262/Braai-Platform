cat > jest.config.mjs <<'EOF'
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: [
    "<rootDir>/src/__tests__/**/*.test.{ts,tsx}",
  ],

  clearMocks: true,

  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/app/**/*.{ts,tsx}",
    "!src/app/layout.tsx",
    "!src/**/*.d.ts",
  ],

  coverageDirectory: "coverage",
};

export default createJestConfig(config);
EOF