# ADR-0005: Auth.js + JWT session cho xác thực email/password

## Bối cảnh

Hệ thống có nhiều người dùng, và **mỗi người chỉ được thấy dữ liệu của chính mình** — cần cách ly dữ liệu thật sự theo người dùng, đòi hỏi xác thực bằng mật khẩu chứ không chỉ gắn nhãn ai tạo.

Yêu cầu cụ thể: đăng ký + đăng nhập ngay bằng **email + password**, **username tuỳ chọn** (không có thì hiển thị email), có điều kiện cơ bản khi đăng ký. Mức triển khai ở giai đoạn này là cơ bản, có thể siết chặt thêm khi cần (đăng xuất mọi thiết bị, khoá tài khoản tức thì...) mà không phải đổi kiến trúc nền tảng.

## Quyết định

Dùng **Auth.js (NextAuth) v5** với **Credentials provider** (email/password tự quản lý, không qua OAuth) và **JWT session strategy**.

Ràng buộc kỹ thuật đã xác minh qua tài liệu chính thức của Auth.js: **Credentials provider bắt buộc dùng JWT session** — nếu cấu hình `strategy: "database"` cùng Credentials provider, Auth.js ném lỗi `UnsupportedStrategy`. Vì vậy JWT không phải là lựa chọn tối ưu được cân nhắc thêm — nó là điều kiện bắt buộc một khi đã chọn Auth.js + Credentials.

Quy tắc xác thực cơ bản áp dụng khi đăng ký (NFR-09):
- Email: đúng định dạng, duy nhất trong hệ thống.
- Password: tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số. Hash bằng **bcrypt** (`bcryptjs`) trước khi lưu, không lưu plaintext (NFR-08).
- Username: tuỳ chọn; nếu nhập, tối thiểu 3 ký tự và duy nhất. Nếu để trống, UI hiển thị email làm tên hiển thị.

## Lý do

- Auth.js là thư viện chuẩn phổ biến nhất cho Next.js, xử lý sẵn các chi tiết bảo mật dễ làm sai nếu tự viết: cookie `httpOnly`/`secure`/`sameSite`, ký và giải mã JWT, CSRF cho form đăng nhập.
- Tích hợp thẳng vào App Router qua Route Handler (`api/auth/[...nextauth]/route.ts`) và middleware — khớp với kiến trúc "chung 1 source" đã chọn (ADR-0001).
- JWT session nghĩa là **không cần bảng `Session` trong DB** — giảm một phần schema.

## Hệ quả

**Tốt:** triển khai nhanh, ít code tự viết, ít bề mặt lỗi bảo mật tự tạo ra.

**Đánh đổi (cần biết để giải thích khi có người hỏi):**
- **Không thu hồi phiên tức thì.** Đăng xuất chỉ xoá cookie ở trình duyệt hiện tại — nếu JWT bị đánh cắp, nó vẫn hợp lệ tới khi hết hạn, không có cách "vô hiệu hoá ngay" như session lưu DB. Giảm thiểu bằng cách đặt thời hạn JWT ngắn (ví dụ 7 ngày) qua cấu hình `session.maxAge`.
- Tính năng "đăng xuất mọi thiết bị" hoặc khoá tài khoản có hiệu lực ngay lập tức đòi hỏi nâng cấp: hoặc chuyển sang session lưu DB (phải bỏ Credentials provider mặc định, tự viết luồng xác thực), hoặc thêm cơ chế blacklist token.

## Phương án đã loại

- **Session lưu DB:** không tương thích với Credentials provider của Auth.js — phải tự viết toàn bộ luồng xác thực (không dùng được Auth.js), tốn nhiều công hơn cho một hệ thống ở mức cơ bản. Có thể cân nhắc lại nếu sau này cần thu hồi phiên tức thì.
- **Nhận diện qua tên tự khai (không mật khẩu, lưu cookie):** không cách ly dữ liệu thật sự giữa các người dùng — ai cũng đổi tên được để xem dữ liệu người khác, không đáp ứng yêu cầu cách ly.

## Ghi chú triển khai: auth làm sau cùng, không chặn luồng chính

Auth vẫn phải đúng kiến trúc và phân quyền rõ ràng như trên, nhưng **triển khai ở bước cuối cùng của Giai đoạn 2**, sau khi luồng chính (tạo `SpyTask` → job pipeline → hiển thị kết quả `SpyTaskItem`) đã chạy hoàn chỉnh.

Điều này không mâu thuẫn với thiết kế vì `server/services` tách khỏi session ngay từ đầu (xem [project-structure.md](../02-architecture/project-structure.md)) — mọi hàm service nhận `userId` như **tham số**, không tự đọc session. Cách thực hiện:

1. **Lúc build luồng chính:** seed sẵn một bản ghi `User` mặc định trong DB (Prisma seed script). `tRPC context` tạm thời gán cứng `userId` của user này thay vì đọc JWT. Toàn bộ `services`, job pipeline, UI sidebar lịch sử/chi tiết phát triển và test đầy đủ với `userId` cố định này.
2. **Bước cuối cùng:** cắm Auth.js — chỉ sửa đúng một chỗ (`server/trpc/init.ts`: context lấy `userId` từ session JWT thay vì hằng số cố định), thêm route/trang login/register và `middleware.ts` chặn truy cập khi chưa đăng nhập. Không đụng tới `services`, `providers`, `queue`, hay UI đã có.

Nhờ vậy schema (`userId` bắt buộc trên `SpyTask`) đúng ngay từ đầu, không phải migrate lại khi thêm auth sau.
