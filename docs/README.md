# TikTok Spy — Tài liệu dự án

Công cụ theo dõi sản phẩm TikTok Shop: gọi API của nhà cung cấp bên ngoài để "spy" sản phẩm theo từ khoá, chuẩn hoá dữ liệu (ảnh, tiêu đề, giá, số liệu bán hàng) và lưu lại để xem trên dashboard.

## Cách đọc

Đọc theo thứ tự — mỗi phần dựa trên phần trước:

1. **[01-business](01-business/)** — Vấn đề cần giải quyết, yêu cầu chức năng/phi chức năng, thuật ngữ nghiệp vụ.
2. **[02-architecture](02-architecture/)** — Công nghệ, kiến trúc hệ thống, mô hình dữ liệu, luồng xử lý job, cấu trúc thư mục.
3. **[03-decisions](03-decisions/)** — Các ADR ghi lại lý do đằng sau từng quyết định kiến trúc.
4. **[04-integration](04-integration/)** — Hợp đồng tích hợp với API bên ngoài (spy + lấy kết quả).
5. **[05-operations](05-operations/)** — Triển khai Docker, biến môi trường, vận hành.

## Trạng thái dự án

Giai đoạn hiện tại: **phân tích & thiết kế**. Chưa có source code. Xem [02-architecture/project-structure.md](02-architecture/project-structure.md) cho cấu trúc sẽ scaffold ở giai đoạn kế tiếp.

**Thứ tự triển khai Giai đoạn 2 (đã chốt):** luồng chính trước (tạo `SpyTask` → job pipeline → sidebar lịch sử → chi tiết `SpyTaskItem`, dùng user mặc định seed sẵn), **auth (Auth.js) làm sau cùng** — xem [03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md](03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md) mục "Ghi chú triển khai".

Spec chi tiết của 2 API bên ngoài (spy + get-result) **chưa được cấp** — xem [04-integration/external-spy-api.md](04-integration/external-spy-api.md) cho interface tạm và bảng ánh xạ trường cần điền khi có spec.
