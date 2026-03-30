// jest.setup.js

// 1. Import các hàm assertion mở rộng cho DOM (ví dụ: .toBeInTheDocument(), .toHaveTextContent())
import '@testing-library/jest-dom';

// 2. (Tùy chọn) Polyfill cho TextEncoder/TextDecoder
// Môi trường JSDOM đôi khi thiếu cái này, gây lỗi khi chạy test với một số thư viện mới của Next.js
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 3. (Tùy chọn) Mock window.matchMedia
// Nhiều thư viện UI (như component sliders, charts) cần cái này nhưng JSDOM không hỗ trợ
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// 4. (Tùy chọn) Mock ResizeObserver
// Nếu bạn dùng thư viện theo dõi kích thước màn hình
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Console log clean up (Tùy chọn): Giấu bớt warning khi chạy test
// console.error = jest.fn();