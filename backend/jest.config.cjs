/** @type {import("jest").Config} */
module.exports = {
  clearMocks: true,
  maxWorkers: 1,
  preset: "ts-jest",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  testEnvironment: "node",
  testTimeout: 30000,
};
