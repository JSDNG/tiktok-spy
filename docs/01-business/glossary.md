# Thuật ngữ nghiệp vụ

| Thuật ngữ | Định nghĩa |
|---|---|
| **User** | Tài khoản người dùng: email (bắt buộc, duy nhất), username (tuỳ chọn, duy nhất nếu có), password (lưu dạng hash). Là chủ sở hữu của mọi `SpyTask` do mình tạo. |
| **Session (JWT)** | Phiên đăng nhập: sau khi xác thực email/password thành công, hệ thống phát hành một JWT lưu trong cookie httpOnly, dùng để nhận diện `User` ở mỗi request tiếp theo mà không cần tra DB. |
| **Provider** | Dịch vụ bên ngoài cung cấp dữ liệu TikTok Shop qua API (spy + get-result). Hệ thống có thể có nhiều provider trong tương lai. |
| **Spy Task** | Một lượt yêu cầu thu thập dữ liệu, ứng với một lần bấm "spy" trên UI, gắn với `User` đã tạo ra nó. Có vòng đời `PENDING → RUNNING → SUCCEEDED / FAILED / TIMEOUT`. Hiển thị ở sidebar lịch sử. |
| **Provider Task ID** | Định danh do provider trả về khi khởi tạo spy task (bất đồng bộ) — dùng để truy vấn kết quả ở bước sau. |
| **Spy Task Item** | Một sản phẩm tìm được trong một `Spy Task` cụ thể — ảnh chụp dữ liệu **tại đúng thời điểm lần spy đó** (giá, đã bán, đánh giá...). Chỉ insert, không bao giờ update. Cùng một sản phẩm thật xuất hiện ở nhiều lần spy khác nhau sẽ tạo ra nhiều `Spy Task Item` độc lập, không gộp lại. |
| **Metrics** | Các số liệu định lượng gắn trên một `Spy Task Item`: `price`, `originalPrice`, `soldCount`, `rating`, `reviewCount` — phản ánh đúng thời điểm lần spy tạo ra dòng đó. |
| **Shop** | Gian hàng bán sản phẩm trên TikTok Shop, lưu dưới dạng thuộc tính của `Spy Task Item`. |
| **Category** | Danh mục sản phẩm theo phân loại của provider — có trong schema nhưng provider hiện tại không trả field này. |

## Quan hệ khái niệm

```
User (1) ──owns──> (N) SpyTask ──contains──> (N) SpyTaskItem
```

Mỗi `User` chỉ thấy `SpyTask` (và `SpyTaskItem` bên trong) do chính mình tạo. Một `SpyTask` có thể trả về nhiều sản phẩm → mỗi sản phẩm là một `SpyTaskItem` mới được **insert**, gắn với `spyTaskId` của lần chạy đó — không có khái niệm "sản phẩm duy nhất" xuyên suốt nhiều lần spy.
