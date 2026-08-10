# ADR-0003: BullMQ + Redis cho polling nền, worker là process riêng

## Bối cảnh

Provider xử lý spy bất đồng bộ: gọi API khởi tạo nhận về `taskId`, phải tự poll một API khác cho tới khi có kết quả. Thời gian xử lý không cố định, có thể mất vài giây tới vài phút. NFR-04 yêu cầu retry có backoff và giới hạn tổng thời gian.

## Quyết định

Dùng **BullMQ** (hàng đợi trên Redis) cho job `poll-spy-result`. Worker chạy như một **process Node độc lập** (`worker.ts`), tách khỏi tiến trình Next.js, nhưng import cùng `server/services` và cùng Prisma Client với `app`.

## Lý do

- Next.js server được thiết kế cho vòng đời request-response ngắn; giữ một request mở để poll trong nhiều phút là phản pattern (timeout, tốn worker slot của Next.js).
- BullMQ có sẵn cơ chế `moveToDelayed` + `DelayedError` để tạm dừng và lên lịch lại một job đang xử lý dở mà không mất trạng thái (tài liệu chính thức BullMQ, pattern "process step jobs") — khớp chính xác nhu cầu "chưa xong thì chờ rồi hỏi lại".
- BullMQ có `attempts` + `backoff` (fixed/exponential, có `jitter`) sẵn cho lỗi mạng/5xx — không phải tự viết retry logic.
- Redis đã là lựa chọn phổ biến, nhẹ, dễ chạy trong Docker Compose cùng ứng dụng.

## Hệ quả

**Tốt:** polling sống sót qua restart process (job nằm trong Redis, không nằm trong bộ nhớ), retry/backoff có cấu hình rõ ràng, dễ quan sát qua Bull Board nếu cần sau này.

**Đánh đổi:** thêm một service (`redis`) và một process (`worker`) vào hạ tầng — đổi lại đây là chi phí hợp lý so với việc tự viết cơ chế polling bền vững từ đầu.

## Phương án đã loại

- **`setInterval`/cron job đơn giản bên trong Next.js API route:** không sống sót qua restart, không có retry/backoff có cấu trúc, khó giới hạn timeout tổng — vi phạm NFR-04.
- **pg-boss (queue trên chính PostgreSQL, bỏ Redis):** giảm được một service hạ tầng, nhưng hệ sinh thái pattern "step job" (delay giữa các lần thử mà không mất context) không thành thục bằng BullMQ. Có thể cân nhắc lại nếu muốn tối giản hạ tầng ở giai đoạn sau.
