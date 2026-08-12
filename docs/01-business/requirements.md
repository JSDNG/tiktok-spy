# Yêu cầu

## Yêu cầu chức năng

| Mã | Yêu cầu |
|---|---|
| FR-00a | Người dùng đăng ký tài khoản bằng email + password; username tuỳ chọn (nếu bỏ trống, UI hiển thị email thay cho tên hiển thị). |
| FR-00b | Người dùng đăng nhập bằng email + password, nhận phiên đăng nhập (JWT lưu trong cookie httpOnly). |
| FR-00c | Mọi trang dữ liệu (lịch sử spy, kết quả) yêu cầu đã đăng nhập; mỗi người dùng chỉ thấy dữ liệu do chính mình tạo (lọc theo `userId`). |
| FR-00d | Mỗi `User` có `role` (`USER` hoặc `ADMIN`, mặc định `USER`). Đăng ký qua UI luôn tạo tài khoản `USER`; tài khoản `ADMIN` đầu tiên do seed script tạo/gán (xem NFR-11). |
| FR-01 | Người dùng nhập **từ khoá** và bấm chạy từ UI. |
| FR-02 | Hệ thống gọi API khởi tạo (`startSpy`) của provider, lưu `providerTaskId`, tạo `SpyTask` trạng thái `PENDING` gắn với `userId` của người tạo. |
| FR-03 | Worker nền tự động gọi API lấy kết quả (`fetchResult`) theo `providerTaskId`, lặp lại cho tới khi xong hoặc quá hạn. |
| FR-04 | Kết quả trả về được chuẩn hoá rồi **insert** vào `SpyTaskItem`, mỗi sản phẩm tìm được là một dòng gắn với `spyTaskId` — không ghi đè, không gộp với lần spy khác. |
| FR-05 | Sidebar lịch sử: liệt kê các lần spy của người dùng hiện tại (từ khoá, thời điểm, trạng thái, số sản phẩm thu được, thông báo lỗi nếu có), mới nhất lên đầu. |
| FR-06 | Bấm vào một mục trong sidebar → trang chi tiết hiển thị danh sách `SpyTaskItem` của đúng lần spy đó (bảng có sort, tìm theo tên, phân trang) — dữ liệu đúng như tại thời điểm lần đó, không phải số liệu mới nhất. |
| FR-07 | UI tự cập nhật trạng thái mục đang chạy trong sidebar (poll định kỳ), không cần người dùng tải lại trang. |
| FR-08 | Trang `/admin` (chỉ `role = ADMIN`, redirect về `/` nếu không đủ quyền) hiển thị: tổng quan (số user, tổng lượt spy, tỷ lệ thành công), xu hướng lượt spy theo trạng thái 30 ngày gần nhất, top từ khoá được spy nhiều nhất, từ khoá 0 kết quả, hoạt động theo từng user (tổng lượt spy, tỷ lệ thành công, lần spy gần nhất), và sức khoẻ provider (tỷ lệ lỗi, thời gian phản hồi TB, breakdown theo `httpStatus` từ `ProviderRequestLog`). |

## Yêu cầu phi chức năng

| Mã | Yêu cầu |
|---|---|
| NFR-01 | Toàn bộ mã nguồn TypeScript `strict`, kiểu dữ liệu an toàn xuyên suốt từ DB tới UI (không dùng `any` ở ranh giới dữ liệu). |
| NFR-02 | Toàn bộ hệ thống khởi động bằng một lệnh `docker compose up` trên VPS. |
| NFR-03 | Lời gọi tới provider bên ngoài phải cô lập sau một interface (`SpyProvider`) — đổi/thêm nhà cung cấp không ảnh hưởng service hay UI. |
| NFR-04 | Job polling chịu lỗi: có retry với backoff luỹ thừa, có giới hạn tổng thời gian chờ (timeout), không polling vô hạn. |
| NFR-05 | Khoá API của provider chỉ tồn tại phía server (biến môi trường), không bao giờ lộ ra bundle/response phía client. |
| NFR-06 | `userId` là trường bắt buộc (không nullable) trên `SpyTask` — mọi bản ghi thuộc về đúng một người dùng ngay từ đầu. `SpyTaskItem` thừa hưởng quyền qua `spyTask.userId`, không có cột `userId` riêng. |
| NFR-07 | Ghi lại lịch sử gọi API provider (endpoint, mã trạng thái, thời gian phản hồi) phục vụ gỡ lỗi tích hợp. |
| NFR-08 | Password không lưu dạng plaintext — hash bằng bcrypt trước khi ghi DB. |
| NFR-09 | Email đăng ký phải đúng định dạng và duy nhất; password tối thiểu 8 ký tự, chứa ít nhất 1 chữ và 1 số. Username (nếu nhập) tối thiểu 3 ký tự, duy nhất. |
| NFR-10 | Mọi truy vấn/đột biến tRPC đọc `SpyTask` hoặc `SpyTaskItem` phải kiểm tra `spyTask.userId` khớp phiên đăng nhập hiện tại — thực thi ở tầng `services`, không dựa vào việc UI ẩn dữ liệu. |
| NFR-11 | Mọi thủ tục tRPC dưới `admin.*` phải kiểm tra `role = ADMIN` ở tầng `adminProcedure` (không dựa vào UI ẩn link) — trả `FORBIDDEN` nếu không đủ quyền. Tài khoản `ADMIN` đầu tiên được tạo/gán qua `prisma/seed.ts` (dùng lại `SEED_USER_EMAIL`/`SEED_USER_PASSWORD`, không cần biến môi trường riêng); script set `role: 'ADMIN'` ở cả nhánh `create` và `update` để idempotent. |

## Hoãn lại có chủ đích (YAGNI)

Các mục sau **không** nằm trong giai đoạn 1, ghi rõ để tránh over-engineering:

- Biểu đồ biến động giá/soldCount/rating theo thời gian cho một sản phẩm hoặc một từ khoá cụ thể (nhóm "insight sản phẩm" — top shop, khoảng giá theo từ khoá) — thống kê admin giai đoạn này chỉ dừng ở mức hoạt động user, từ khoá, vận hành hệ thống (FR-08), chưa đào sâu vào `SpyTaskItem`.
- Đăng nhập qua OAuth (Google/Facebook), quên mật khẩu, xác thực email, đổi mật khẩu.
- Chạy spy theo lịch (cron) — chỉ kích hoạt thủ công.
- Cảnh báo/thông báo (email, webhook) khi số liệu thay đổi bất thường.
- Xuất dữ liệu (Excel, CSV, PDF) — kể cả cho trang thống kê admin.
- Cache/CDN cho ảnh sản phẩm — dùng thẳng `imageUrl` từ provider.
- Rate limiting/quota theo người dùng.
- Xoá/dọn dẹp `SpyTaskItem` cũ theo thời gian (ví dụ tự động xoá sau 1-3 tháng) — MVP giữ toàn bộ lịch sử vô thời hạn, không có job dọn dẹp.
- Phân quyền nhiều cấp hơn 2 role (`USER`/`ADMIN`) — chưa có nhu cầu.
- Bảng tổng hợp/materialized view cho thống kê admin — tính on-the-fly bằng Prisma `groupBy`/aggregate là đủ ở quy mô hiện tại; chỉ cân nhắc khi query chậm thật.

## Truy vết yêu cầu → kiến trúc

| Mã | Đáp ứng tại |
|---|---|
| FR-00a, FR-00b, FR-00c | [adr-0005](../03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md), [data-model.md](../02-architecture/data-model.md) (`User`) |
| FR-01, FR-07 | [job-pipeline.md](../02-architecture/job-pipeline.md) §1, §4 |
| FR-02, FR-03 | [job-pipeline.md](../02-architecture/job-pipeline.md) §2–4 |
| FR-04 | [data-model.md](../02-architecture/data-model.md) (`SpyTaskItem`), [job-pipeline.md](../02-architecture/job-pipeline.md) §4 |
| FR-05, FR-06 | [project-structure.md](../02-architecture/project-structure.md) (`features/history`), [data-model.md](../02-architecture/data-model.md) (`SpyTask`) |
| FR-00d, FR-08, NFR-11 | [data-model.md](../02-architecture/data-model.md) (`User.role`, `SpyTask.keyword`), `features/admin`, `server/services/adminStats.ts`, `server/trpc/routers/admin.router.ts` |
| NFR-01 | [tech-stack.md](../02-architecture/tech-stack.md), [adr-0002](../03-decisions/adr-0002-trpc-thay-vi-rest.md) |
| NFR-02 | [deployment.md](../05-operations/deployment.md) |
| NFR-03 | [adr-0004](../03-decisions/adr-0004-provider-adapter-layer.md) |
| NFR-04 | [job-pipeline.md](../02-architecture/job-pipeline.md) §4, [adr-0003](../03-decisions/adr-0003-bullmq-redis-cho-job-polling.md) |
| NFR-05 | [external-spy-api.md](../04-integration/external-spy-api.md), [deployment.md](../05-operations/deployment.md) |
| NFR-06, NFR-10 | [data-model.md](../02-architecture/data-model.md), [adr-0005](../03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md) |
| NFR-07 | [data-model.md](../02-architecture/data-model.md) (`ProviderRequestLog`) |
| NFR-08, NFR-09 | [adr-0005](../03-decisions/adr-0005-authjs-jwt-cho-xac-thuc.md) |
