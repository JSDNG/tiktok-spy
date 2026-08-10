# Bối cảnh & Vấn đề

## Bối cảnh

Nghiên cứu sản phẩm trên TikTok Shop hiện làm thủ công: mở app/web, tìm theo từ khoá, tự ghi lại giá và số liệu bán hàng. Không có nơi lưu trữ tập trung — kết quả tra cứu mất đi ngay khi rời trang.

## Vấn đề

- Không có lịch sử: mỗi lần tìm theo từ khoá, kết quả chỉ xem được ngay lúc đó, không lưu lại để xem sau hay đối chiếu với lần tìm trước.
- Việc tra cứu lặp lại tốn thời gian và dễ bỏ sót sản phẩm tiềm năng.

## Mục tiêu

Xây một hệ thống nội bộ:
1. Kích hoạt "spy" theo từ khoá qua API của nhà cung cấp dữ liệu bên ngoài.
2. Tự động chờ và lấy kết quả (xử lý bất đồng bộ qua `taskId`).
3. Lưu lại kết quả **của từng lần spy riêng biệt** — mỗi lần bấm "spy" là một mục trong lịch sử, không bị lần sau ghi đè.
4. Hiển thị lịch sử các lần spy ở sidebar; bấm vào một lần cụ thể để xem đúng kết quả (giá, số liệu bán) tại thời điểm đó.

## Phạm vi giai đoạn 1 (MVP)

**Có:**
- Nhiều người dùng, đăng ký/đăng nhập bằng email + password (username tuỳ chọn).
- Mỗi người dùng chỉ thấy dữ liệu (lịch sử spy, kết quả) do chính mình tạo.
- Kích hoạt spy thủ công từ UI, chỉ nhập từ khoá.
- Sidebar liệt kê lịch sử các lần spy; bấm vào một lần để xem chi tiết kết quả — dữ liệu được **giữ nguyên vẹn** theo từng lần, không ghi đè.

**Chưa có (hoãn có chủ đích — xem `requirements.md`):**
- Biểu đồ biến động giá/doanh số của một sản phẩm theo thời gian (khác với lịch sử các lần spy — mục đó đã có trong MVP).
- Trang "tất cả sản phẩm" gộp lại, loại trùng giữa các lần spy.
- Đăng nhập qua OAuth (Google/Facebook), quên mật khẩu, xác thực email.
- Phân quyền vai trò (admin/member) — hiện tại mọi tài khoản ngang quyền, chỉ tách biệt theo dữ liệu sở hữu.
- Lập lịch tự động (cron).
- Cảnh báo/thông báo khi giá hoặc doanh số thay đổi bất thường.
- Xuất báo cáo (Excel/PDF).

## Tiêu chí thành công

- Chạy được toàn bộ hệ thống bằng `docker compose up` trên một VPS.
- Từ lúc bấm "spy" tới lúc thấy kết quả xuất hiện trong lịch sử là một luồng tự động, không cần thao tác tay ở giữa.
- Hai tài khoản khác nhau đăng nhập cùng lúc, mỗi người chỉ thấy lịch sử/kết quả của mình.
- Spy cùng một từ khoá 2 lần ở 2 thời điểm khác nhau, cả 2 lần vẫn xem lại được riêng biệt trong sidebar.
- Đổi nhà cung cấp dữ liệu (provider) không đòi hỏi sửa logic nghiệp vụ hay schema.
