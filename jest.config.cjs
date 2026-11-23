module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.cjs"],
  modulePathIgnorePatterns: ["<rootDir>/.expo/", "<rootDir>/dist/"],
  transform: { "^.+\\.ts$": "<rootDir>/tests/transform.cjs" },
};
