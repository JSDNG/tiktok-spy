# Quy tắc Git: nhánh & commit

## Chiến lược nhánh: GitHub Flow đơn giản hoá

- `main` là nhánh duy nhất, luôn ở trạng thái triển khai được.
- Mọi thay đổi tạo từ một nhánh riêng nhánh từ `main`, merge lại `main` khi xong (qua PR hoặc merge local nếu làm một mình).
- **Không dùng** mô hình Git Flow đầy đủ (`develop`, `release/*` dài hạn) — quá phức tạp cho quy mô dự án hiện tại (một người dùng, chưa có versioned release). Thêm khi thực sự cần release theo phiên bản.

## Đặt tên nhánh — theo [Conventional Branch](https://conventional-branch.github.io/)

Quy tắc đặt tên:
- Chỉ chữ thường, số, dấu gạch ngang (`-`), dấu chấm (`.`).
- Không gạch ngang/chấm liên tiếp, ở đầu hay cuối.
- Ngắn gọn, mô tả đúng nội dung.

| Prefix | Dùng khi |
|---|---|
| `feature/` | Thêm tính năng mới |
| `fix/` | Sửa lỗi |
| `chore/` | Việc không phải tính năng: tài liệu, cấu hình, dependency |
| `hotfix/` | Sửa khẩn cấp trên production |

Ví dụ áp dụng cho các mốc việc của dự án (Giai đoạn 2):

```
feature/scaffold-core-flow
feature/spy-task-pipeline
feature/history-sidebar-ui
feature/authjs-integration
fix/apify-status-mapping
chore/git-workflow-and-coding-standards
```

## Commit message — theo [Conventional Commits](https://www.conventionalcommits.org/)

Cấu trúc:

```
<type>[phạm vi tuỳ chọn]: <mô tả>

[nội dung chi tiết tuỳ chọn]

[footer tuỳ chọn]
```

Type dùng trong dự án:

| Type | Ý nghĩa |
|---|---|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `docs` | Chỉ thay đổi tài liệu |
| `refactor` | Đổi cấu trúc code, không đổi hành vi |
| `test` | Thêm/sửa test |
| `chore` | Việc vặt: cấu hình, dependency, không ảnh hưởng code chạy |

Ví dụ:

```
feat(spy-task): add createSpyTask service
fix(apify-adapter): map TIMED-OUT status to FAILED
docs: update job-pipeline polling parameters
test(services): add unit test for persistResult idempotency
```

**Breaking change:** thêm `!` sau type (`feat!: ...`) hoặc footer `BREAKING CHANGE: ...`. Hiếm khi cần ở giai đoạn hiện tại vì chưa có consumer bên ngoài phụ thuộc vào API nội bộ.

## Quy trình làm việc

1. Checkout từ `main` mới nhất: `git checkout main && git pull`.
2. Tạo nhánh theo quy tắc đặt tên ở trên.
3. Code theo TDD (xem [coding-standards.md](coding-standards.md)), commit nhiều lần nhỏ theo Conventional Commits thay vì 1 commit khổng lồ.
4. Merge lại `main` khi hoàn thành — qua PR trên GitHub hoặc merge local nếu đã tự kiểm thử kỹ.
5. Xoá nhánh sau khi merge (`git branch -d <tên-nhánh>`).

## Không tự động hoá ở giai đoạn này

Chưa cấu hình branch protection rule hay commit-check tool (validate tên nhánh/commit tự động qua CI) — làm sau nếu cần, thuộc phạm vi mục CI/CD đã hoãn (xem `requirements.md` mục YAGNI). Quy tắc trong file này áp dụng thủ công.
