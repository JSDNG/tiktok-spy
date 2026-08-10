# Công nghệ sử dụng

| Lớp | Công nghệ | Version | Lý do |
|---|---|---|---|
| Framework | Next.js (App Router) + React | Next 16.x / React 19 | Một source chứa cả UI và API nội bộ, một process, một lần deploy — đáp ứng NFR "backend + frontend chung source". |
| Ngôn ngữ | TypeScript | 5.x, `strict: true` | Bắt buộc theo NFR-01. |
| API nội bộ | tRPC + TanStack Query | v11 / v5 | Gọi hàm backend từ frontend với kiểu dữ liệu suy luận tự động, không phải viết/đồng bộ DTO hai lần. Xem [ADR-0002](../03-decisions/adr-0002-trpc-thay-vi-rest.md). |
| ORM | Prisma | 7.x | Schema khai báo, migration có version, Prisma Client sinh kiểu TypeScript tự động khớp DB. |
| Database | PostgreSQL | 16 | Dữ liệu quan hệ (User ↔ SpyTask ↔ SpyTaskItem). |
| Xác thực | Auth.js (NextAuth) v5 + Credentials provider | v5 | Đăng nhập email/password chuẩn hoá, xử lý sẵn cookie/CSRF, tích hợp thẳng vào Next.js. Bắt buộc dùng JWT session — giới hạn của thư viện khi dùng Credentials provider. Xem [ADR-0005](../03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md). |
| Hash password | bcryptjs | mới nhất | Thuần JavaScript, không cần compile native binding, đơn giản cài đặt/deploy trong Docker; là chuẩn phổ biến lâu năm, đủ an toàn cho quy mô hệ thống này. |
| Job queue | BullMQ + Redis | BullMQ 5.x / Redis 7 | Polling nền có sẵn retry, backoff luỹ thừa, delay giữa các lần poll — đúng nhu cầu chờ `taskId` xử lý bất đồng bộ. Xem [ADR-0003](../03-decisions/adr-0003-bullmq-redis-cho-job-polling.md). |
| UI | Tailwind CSS + shadcn/ui + TanStack Table | Tailwind 4 / Table v8 | shadcn/ui đưa component thẳng vào source (không phải black-box package) nên tuỳ biến tự do; TanStack Table xử lý sort/tìm kiếm/phân trang cho bảng kết quả spy hiệu quả với dữ liệu lớn. |
| Validate | Zod | 3.x/4.x | Validate input tRPC, biến môi trường, và response chuẩn hoá từ provider. |
| Test | Vitest + Playwright | mới nhất | Vitest cho unit/integration (services, adapter), Playwright cho luồng end-to-end thật trên UI. |
| Hạ tầng | Docker Compose | — | 4 service: `app`, `worker`, `postgres`, `redis` — khởi động bằng một lệnh (NFR-02). |

## Phương án đã cân nhắc và loại bỏ

| Phương án | Lý do loại bỏ |
|---|---|
| NestJS (backend) + React/Vite (frontend) tách 2 repo/2 process | Vi phạm trực tiếp yêu cầu "chung 1 source"; phải đồng bộ type thủ công hoặc sinh OpenAPI, tốn thêm một bước build. |
| Nuxt / SvelteKit | Cùng mô hình full-stack như Next.js nhưng hệ sinh thái thư viện UI data-table và job-queue (BullMQ Node-first) ít thành thục hơn trong Vue/Svelte. |
| REST + OpenAPI codegen thay vì tRPC | Thêm bước sinh mã (codegen) mỗi khi đổi API, chậm vòng lặp phát triển; tRPC bỏ qua bước này vì dùng chung TypeScript hai đầu. |
| Polling bằng `setInterval` thuần trong Next.js API route thay vì BullMQ | Không có retry/backoff có cấu trúc, không sống sót qua restart process, không kiểm soát được số lần thử — vi phạm NFR-04. |
