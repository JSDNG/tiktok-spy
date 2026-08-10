# ADR-0002: tRPC thay vì REST cho API nội bộ

## Bối cảnh

Frontend cần gọi các thao tác: tạo `SpyTask`, đọc trạng thái, liệt kê lịch sử (sidebar), lấy chi tiết `SpyTaskItem` của một lần spy cụ thể. Yêu cầu NFR-01 đòi hỏi kiểu dữ liệu an toàn xuyên suốt từ DB tới UI.

## Quyết định

Dùng **tRPC v11** làm lớp giao tiếp giữa `app` (frontend) và `server/services` (backend), kết hợp TanStack Query để cache/refetch ở client.

## Lý do

- Vì backend và frontend đã chung một source (ADR-0001), tRPC tận dụng được điều đó tối đa: kiểu trả về của một hàm ở server tự động suy luận ở client, không cần viết interface/DTO riêng, không cần bước sinh mã (codegen).
- TanStack Query tích hợp sẵn `refetchInterval` — dùng thẳng cho việc UI theo dõi trạng thái `SpyTask` (FR-07) mà không cần WebSocket.
- Input validate bằng Zod ngay tại router, lỗi trả về có kiểu rõ ràng.

## Hệ quả

**Tốt:** không có tầng trung gian định nghĩa API contract; sửa service, sửa router, UI báo lỗi kiểu ngay lập tức nếu không khớp.

**Đánh đổi:** client bắt buộc là TypeScript (không phải rào cản ở đây vì chỉ có một frontend Next.js). Nếu tương lai cần mở API cho hệ thống bên thứ ba (không phải TS), sẽ cần thêm một REST endpoint mỏng gọi lại `server/services` — không phải viết lại nghiệp vụ.

## Phương án đã loại

- **REST + OpenAPI codegen:** thêm bước sinh client mỗi khi đổi API, làm chậm vòng lặp phát triển so với lợi ích mang lại ở quy mô một frontend nội bộ.
- **GraphQL:** over-engineering cho số lượng thao tác ít và không có nhu cầu truy vấn linh hoạt từ nhiều client khác nhau.
