const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: [],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});