import { apifySpyProvider } from './apify.adapter';
import { mockSpyProvider } from './mock.adapter';

// Test/e2e dùng mockSpyProvider để không phụ thuộc mạng/quota Apify thật.
// Dùng biến riêng thay vì NODE_ENV vì `next dev` luôn ép NODE_ENV=development,
// bất kể giá trị truyền vào từ ngoài. Cả router (tạo task) và worker (poll
// kết quả) đều import từ đây để tránh lệch provider giữa 2 nơi.
export const spyProvider = process.env.USE_MOCK_SPY_PROVIDER === 'true' ? mockSpyProvider : apifySpyProvider;
