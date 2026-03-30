const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Đường dẫn tới thư mục gốc của app Next.js
    dir: './',
})

// Cấu hình tùy chỉnh cho Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    // Xử lý alias imports (nếu bạn dùng @/components/...)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
}

// createJestConfig export cấu hình async để Next.js load các config khác
module.exports = createJestConfig(customJestConfig)