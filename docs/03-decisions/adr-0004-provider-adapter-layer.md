# ADR-0004: Tầng adapter cho nhà cung cấp dữ liệu (provider)

## Bối cảnh

Spec chi tiết của 2 API bên ngoài (khởi tạo spy + lấy kết quả theo `taskId`) **chưa được cung cấp** tại thời điểm thiết kế. Đồng thời NFR-03 yêu cầu đổi/thêm provider không được ảnh hưởng service hay UI.

## Quyết định

Định nghĩa một interface `SpyProvider` trong `src/providers/spy/types.ts`:

```typescript
interface SpyProvider {
  startSpy(params: SpyParams): Promise<{ providerTaskId: string }>;
  fetchResult(providerTaskId: string): Promise<SpyResult>;
}

type SpyResult =
  | { status: 'PENDING' | 'RUNNING' }
  | { status: 'SUCCEEDED'; items: NormalizedSpyItem[] }
  | { status: 'FAILED'; errorMessage: string };
```

Toàn bộ `server/services` chỉ lập trình theo interface này, không biết provider cụ thể là ai. Viết sẵn `mock.adapter.ts` — trả dữ liệu giả lập theo đúng shape `NormalizedSpyItem` — để phát triển và test luồng đầu-cuối (tạo task → poll → hiển thị) **trước khi** có spec thật.

## Lý do

- Cho phép bắt đầu code ngay ở giai đoạn 2 (scaffold, luồng job, UI) mà không bị chặn bởi việc chờ spec API.
- Khi có spec thật: chỉ cần viết một file `*.adapter.ts` implement `SpyProvider`, điền bảng ánh xạ trường trong [external-spy-api.md](../04-integration/external-spy-api.md), và đổi một dòng cấu hình chọn adapter — không đụng tới `services`, `queue`, hay UI.
- `mock.adapter.ts` tiếp tục có giá trị lâu dài: dùng trong test (Vitest) để không phụ thuộc mạng/API thật khi chạy CI.

## Hệ quả

**Tốt:** tách rời hoàn toàn rủi ro "spec chưa có" khỏi phần còn lại của hệ thống; dễ test; dễ thêm provider thứ hai nếu cần so sánh nguồn dữ liệu sau này.

**Đánh đổi:** phải thiết kế `NormalizedSpyItem` đủ tổng quát để không phải đổi shape khi có spec thật — chấp nhận rủi ro nhỏ này, xử lý bằng cách giữ các trường tối thiểu, mở rộng dễ dàng (thêm field optional) thay vì đổi field bắt buộc.

## Phương án đã loại

- **Gọi thẳng HTTP tới provider trong `services`:** nhanh hơn ở bước đầu nhưng khoá cứng service vào một provider cụ thể, vi phạm NFR-03, và không thể phát triển song song trong lúc chờ spec.
