# Cấu trúc thư mục source

```
tiktok-spy/
├── docker-compose.yml            # app, worker, postgres, redis
├── Dockerfile                    # multi-stage build, dùng chung cho app & worker
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── worker.ts                     # entrypoint process worker (node worker.ts)
├── src/
│   ├── middleware.ts              # chặn truy cập route (dashboard) khi chưa đăng nhập
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   └── auth/[...nextauth]/route.ts   # Auth.js route handler
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # layout có sidebar lịch sử SpyTask
│   │   │   ├── page.tsx          # trang tạo spy task (ô nhập từ khoá)
│   │   │   └── tasks/[id]/       # trang chi tiết 1 lần spy: danh sách SpyTaskItem
│   │   └── layout.tsx
│   ├── server/
│   │   ├── auth/
│   │   │   ├── config.ts         # cấu hình Auth.js: Credentials provider, JWT callbacks
│   │   │   └── password.ts       # hash/verify password bằng bcrypt
│   │   ├── trpc/
│   │   │   ├── init.ts           # initTRPC, context (đọc session → userId)
│   │   │   └── routers/          # auth.router.ts, spyTask.router.ts, _app.ts
│   │   ├── services/             # nghiệp vụ thuần: registerUser, createSpyTask, persistResult, getSpyTaskDetail, listSpyTasks...
│   │   ├── queue/                # connection.ts, spyQueue.ts, spyWorker.ts
│   │   └── db.ts                 # Prisma Client singleton
│   ├── providers/
│   │   └── spy/
│   │       ├── types.ts          # interface SpyProvider, NormalizedSpyItem, SpyResult
│   │       ├── mock.adapter.ts   # adapter giả lập, dùng khi chưa có spec thật
│   │       └── <provider>.adapter.ts  # thêm khi có spec API thật
│   ├── features/
│   │   ├── auth/                 # LoginForm, RegisterForm (client components)
│   │   └── history/               # TaskHistorySidebar, TaskItemsTable (client components)
│   ├── components/ui/            # shadcn/ui (generated, chỉnh sửa trực tiếp trong repo)
│   └── lib/
│       ├── env.ts                # Zod schema cho biến môi trường (gồm AUTH_SECRET)
│       └── utils.ts
└── tests/
    ├── unit/                     # services, adapter, password hashing (Vitest)
    └── e2e/                      # đăng ký → đăng nhập → tạo task → xem lịch sử/chi tiết (Playwright)
```

## Quy tắc phụ thuộc (một chiều)

```
app/  ──>  server/trpc/  ──>  server/services/  ──>  providers/  +  server/db.ts
worker.ts ──────────────────>  server/services/
```

- `server/services` là nghiệp vụ thuần: **không** import bất kỳ thứ gì thuộc React, Next.js request/response, hay BullMQ trực tiếp — chỉ nhận tham số (kể cả `userId` — luôn nhận từ tham số, không tự lấy session), trả dữ liệu, gọi `providers` và `db`. Nhờ vậy `app` (tRPC router) và `worker.ts` đều gọi lại được cùng một hàm mà không trùng logic.
- `server/trpc/routers` chỉ làm việc "mỏng": validate input bằng Zod, lấy `userId` từ `ctx.session` (do `server/trpc/init.ts` gắn vào context qua Auth.js), gọi `services`, trả kết quả — không chứa logic nghiệp vụ.
- `server/auth` là ranh giới duy nhất xử lý password/JWT — `services` và các phần khác không tự hash password hay đọc token.
- `providers/spy` là ranh giới duy nhất được phép gọi HTTP ra ngoài tới nhà cung cấp dữ liệu.
- `features/*` chứa component UI đặc thù theo domain (sidebar lịch sử, bảng kết quả); `components/ui` chỉ chứa primitive tái dùng (Button, Table, Dialog... từ shadcn/ui).
