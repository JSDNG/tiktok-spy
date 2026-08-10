# ADR-0001: Next.js full-stack, một source cho backend và frontend

## Bối cảnh

Yêu cầu tường minh: backend và frontend dùng chung một source code, viết bằng TypeScript. Đội ngũ hiện tại nhỏ (một người dùng/một dev ở giai đoạn 1).

## Quyết định

Dùng **Next.js (App Router)** làm framework duy nhất: UI (React Server/Client Components) và API nội bộ (tRPC route handler) nằm trong cùng một project, cùng một `package.json`, cùng một lần build/deploy.

## Lý do

- Loại bỏ hoàn toàn việc đồng bộ type/API contract giữa hai repo.
- Một lệnh `docker compose up` khởi động toàn bộ app (đáp ứng NFR-02).
- App Router hỗ trợ Route Handlers — đủ để mount tRPC mà không cần server Node riêng cho phần API.

## Hệ quả

**Tốt:**
- Tốc độ phát triển nhanh, một chỗ để tìm code.
- Đổi kiểu dữ liệu ở service tự động phản ánh lên UI qua tRPC (xem ADR-0002).

**Đánh đổi:**
- Next.js server (request/response ngắn hạn) không phù hợp cho tác vụ chạy nền dài (polling `taskId`) → cần một process riêng (`worker`) dùng chung code nhưng chạy độc lập. Xem [ADR-0003](adr-0003-bullmq-redis-cho-job-polling.md).
- Nếu sau này cần mobile app hoặc bên thứ ba gọi API, phải thêm một lớp REST/GraphQL mỏng vì tRPC gắn chặt với TypeScript client.

## Phương án đã loại

- **NestJS (backend) + React/Vite (frontend), hai repo riêng:** tách bạch rõ ràng nhưng vi phạm trực tiếp yêu cầu "chung 1 source" và cần thêm bước đồng bộ type (OpenAPI codegen hoặc viết tay).
