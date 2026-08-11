# Quy tắc code

## Ngôn ngữ & type safety

- TypeScript `strict: true` bắt buộc (NFR-01) — không tắt ở bất kỳ file nào.
- Không dùng `any` ở ranh giới dữ liệu (response provider, input tRPC, query DB) — dùng Zod parse để suy luận type tự động thay vì khai báo tay.
- ESLint dùng [typescript-eslint](https://typescript-eslint.io/) flat config, xếp chồng 3 tầng: `recommended` → `strict` → `stylistic`.
- Prettier lo format, ESLint lo chất lượng code — tách biệt rõ ràng bằng `eslint-config-prettier` (đặt **cuối cùng** trong mảng config để tắt các rule ESLint xung đột với Prettier).

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  eslintConfigPrettier, // luôn để cuối
];
```

## Cấu trúc thư mục

Dùng `src/` theo khuyến nghị chính thức của Next.js (tách code ứng dụng khỏi file cấu hình ở root). Chi tiết đầy đủ xem [project-structure.md](../02-architecture/project-structure.md) — file này chỉ nói **quy tắc đặt tên**, không lặp lại cấu trúc.

## Đặt tên file

Khớp với pattern đã dùng trong `project-structure.md`:

| Loại file | Quy tắc | Ví dụ |
|---|---|---|
| React component | PascalCase, trùng tên component | `ProductTable.tsx`, `LoginForm.tsx` |
| Hook | camelCase, tiền tố `use` | `useSpyTaskStatus.ts` |
| tRPC router | `<domain>.router.ts` (camelCase domain) | `spyTask.router.ts`, `auth.router.ts` |
| Provider adapter | `<provider>.adapter.ts` | `apify.adapter.ts`, `mock.adapter.ts` |
| Service/singleton dùng chung | camelCase, một từ nếu được | `db.ts`, `env.ts`, `utils.ts` |
| Type/interface tập trung | `types.ts` trong thư mục domain | `providers/spy/types.ts` |
| Test | trùng tên file nguồn, hậu tố `.test.ts` | `createSpyTask.test.ts` |

## Đặt tên trong code

- Biến, hàm: `camelCase`.
- Type, interface, React component: `PascalCase`.
- Boolean: tiền tố `is`/`has`/`should` (`isSoldOut`, `hasError`).
- Hằng số cấu hình đọc từ env: `camelCase` sau khi qua `env.ts` (Zod parse) — **không** dùng `UPPER_SNAKE_CASE` trong code nghiệp vụ, chỉ tên biến môi trường thô (`process.env.POLL_INTERVAL_MS`) mới viết hoa.
- Interface không tiền tố `I` (`SpyProvider`, không phải `ISpyProvider`) — theo khuyến nghị phổ biến của cộng đồng TypeScript, tiền tố `I` là dư thừa khi đã có type checking.

## Import

- Dùng path alias `@/` (khai báo trong `tsconfig.json` theo khuyến nghị chính thức Next.js) thay vì relative path dài (`../../../lib/utils`).
- Thứ tự import: package ngoài → alias nội bộ (`@/...`) → relative cùng thư mục. Không bắt buộc công cụ tự động sắp xếp ở MVP — tự giác theo thứ tự này khi viết.

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": { "@/*": ["*"] }
  }
}
```

## Testing

- Vitest cho unit/integration (`server/services`, `providers/spy`) — ưu tiên viết test trước khi code (TDD) cho phần nghiệp vụ và adapter, theo [tech-stack.md](../02-architecture/tech-stack.md).
- Playwright cho luồng end-to-end chính: đăng ký → đăng nhập → tạo spy task → xem lịch sử/chi tiết.
- Test đặt trong `tests/unit/` và `tests/e2e/` theo [project-structure.md](../02-architecture/project-structure.md), không xen giữa source.

## Xử lý lỗi

- **Validate chỉ ở ranh giới hệ thống** — input tRPC (Zod), response provider bên ngoài (Zod parse trong adapter), biến môi trường (`env.ts`). Không validate lại dữ liệu nội bộ đã qua các ranh giới này lần nữa ở tầng sâu hơn.
- **`server/trpc/routers` ném `TRPCError` với code chuẩn của tRPC**, không tự chế mã lỗi riêng:
  - `UNAUTHORIZED` — chưa đăng nhập.
  - `NOT_FOUND` — `SpyTask`/`SpyTaskItem` không tồn tại hoặc không thuộc user hiện tại (không phân biệt 2 trường hợp này trong thông báo lỗi — tránh lộ thông tin `SpyTask` của người khác có tồn tại hay không).
  - `BAD_REQUEST` — input không hợp lệ, tự động sinh ra qua `.input(zodSchema)`, không cần `throw` tay.
  - `CONFLICT` — vi phạm unique constraint (ví dụ `SpyTask.providerTaskId` trùng).
- **Không để lỗi Prisma thô lộ ra client** — bắt `PrismaClientKnownRequestError` trong `server/services`, dịch sang `TRPCError` phù hợp trước khi lỗi đi lên router.
- **Không try/catch phòng hờ cho trường hợp không thể xảy ra** — nếu Zod đã đảm bảo một field tồn tại và đúng kiểu, không viết thêm code kiểm tra lại field đó.

## tRPC procedure

- Input luôn qua `.input(zodSchema)` — không nhận `any`/`unknown` rồi tự validate tay trong handler.
- Output **suy luận tự động** qua kiểu trả về của hàm, không khai báo type thủ công cho response — đây là lợi ích cốt lõi của tRPC (xem [ADR-0002](../03-decisions/adr-0002-trpc-thay-vi-rest.md)). Khi cần dùng type ở client, dùng `inferRouterOutputs<AppRouter>`, không định nghĩa lại interface song song.
- Check session bằng middleware `.use()` một lần trên procedure dùng chung (ví dụ `protectedProcedure`), các router nhạy cảm build trên procedure đó — không lặp lại `if (!ctx.session) throw ...` trong từng handler.

## React Server/Client Component

- Mặc định mọi component là **Server Component** — chỉ thêm `'use client'` khi thật sự cần state/effect/event handler phía trình duyệt (form nhập từ khoá, bảng sort/filter tương tác, polling trạng thái task).
- `'use client'` đặt ở dòng đầu tiên của file, trước mọi import.
- Không thêm `'use client'` phòng hờ cho component không cần — mỗi `'use client'` kéo cả cây import bên dưới nó vào bundle phía client, đặt sai chỗ làm bundle nặng hơn không cần thiết.

## Prisma

- Dùng `select` chỉ lấy field cần dùng cho từng query, không lấy nguyên object rồi lọc field ở tầng JS.
- Ghi nhiều bảng liên quan trong **một transaction ngắn** (đã áp dụng ở `persistResult` — xem [job-pipeline.md](../02-architecture/job-pipeline.md)) — không gọi HTTP hay xử lý nặng bên trong transaction, giữ thời gian transaction càng ngắn càng tốt để tránh deadlock.
- Xem lại migration Prisma sinh ra trước khi `prisma migrate deploy` trên production, không migrate mù.

## Comment

- Mặc định **không viết comment** — tên biến/hàm rõ ràng đã thay được vai trò giải thích.
- Chỉ viết comment khi lý do (**WHY**) không tự hiển thị qua code: một ràng buộc ẩn, một workaround cho hành vi cụ thể của Apify, một invariant dễ gây hiểu nhầm. Ví dụ hợp lệ: `// Apify trả price dạng USD thập phân, không phải cent`.
- Không viết comment mô tả **WHAT** code đang làm — tên định danh tốt đã đủ, comment kiểu này chỉ lỗi thời khi code đổi mà comment quên sửa theo.

## Tái sử dụng & tránh trùng lặp

Dựa theo [Refactoring.Guru](https://refactoring.guru/) (Martin Fowler, *Refactoring: Improving the Design of Existing Code*):

- **Đơn giản là ưu tiên số một — không suy nghĩ xa xôi, không giải quyết vấn đề chưa xảy ra.** Giữa hai cách cùng đúng, luôn chọn cách đơn giản hơn, miễn giữ đúng ranh giới kiến trúc đã có (services/router/adapter tách bạch — xem [project-structure.md](../02-architecture/project-structure.md)). "Đúng cấu trúc" nghĩa là đặt code vào đúng lớp (`services` không lẫn HTTP, router không chứa nghiệp vụ), **không phải** thêm lớp trừu tượng "cho linh hoạt sau này".
- **Tránh DRY quá đà — cảnh giác với "Speculative Generality"** (code smell theo Refactoring.Guru: tạo class/hàm/tham số generic vì "có thể cần sau", chưa từng có nhu cầu thật). Dấu hiệu nhận biết: tham số không ai truyền khác giá trị mặc định, interface chỉ có đúng 1 implementation nhưng thiết kế như sẽ có nhiều, callback/option không nơi nào gọi tới. Trùng lặp đơn giản, dễ đọc **tốt hơn** một abstraction "dùng chung" nhưng khó hiểu, khó sửa — DRY là công cụ phục vụ sự rõ ràng, không phải mục tiêu tự thân.
- **Rule of Three** — viết trùng lặp lần đầu là bình thường, đừng vội trừu tượng hoá. Chỉ tách hàm/module dùng chung khi cùng một đoạn logic xuất hiện **lần thứ ba**. Tách quá sớm (ngay lần 2, hoặc "phòng khi cần sau này") thường tạo ra abstraction sai — tốn công sửa lại còn hơn cả để trùng lặp tạm thời.
- **Ngoại lệ: logic liên quan bảo mật/tính đúng đắn thì tách ngay từ lần đầu**, không chờ tới lần 3. Ví dụ cụ thể trong dự án: kiểm tra `spyTask.userId` khớp phiên đăng nhập (NFR-10) phải nằm trong một hàm dùng chung (ví dụ `assertSpyTaskOwnership`) ngay từ router đầu tiên cần tới — không để mỗi router tự viết `if` riêng, vì chỉ cần một chỗ viết sai/quên là lộ dữ liệu người khác.
- **Hàm dài tới mức cần comment giải thích từng đoạn → tách hàm nhỏ thay vì viết comment** (kỹ thuật "Extract Method", xử lý code smell "Long Method"). Tên hàm mới thay cho comment: `normalizeApifyPrice(...)` rõ hơn `// chuyển giá Apify sang cent` đặt giữa code — vừa tránh comment (mục trên), vừa tránh hàm phình to nhiều trách nhiệm.
- **Guard clause thay vì lồng `if/else` sâu** ("Replace Nested Conditionals with Guard Clauses"): return/throw sớm cho trường hợp biên, phần logic chính không bị thụt lề nhiều tầng. Áp dụng rõ nhất khi map `status` của Apify trong adapter — return sớm cho `RUNNING`/`READY`, return sớm cho `FAILED`/`ABORTED`/`TIMED-OUT`, phần còn lại mới là logic chính xử lý `SUCCEEDED`.
- **Một hàm/module một trách nhiệm** — file `services/spyTask.ts` chỉ lo nghiệp vụ `SpyTask`, không lẫn logic chuẩn hoá dữ liệu provider (thuộc `providers/spy/apify.adapter.ts`) hay validate input (thuộc Zod schema ở router). Khi một file phình to, gánh nhiều việc không liên quan nhau (code smell "Large Class") — tách theo đúng ranh giới domain đã vạch trong [project-structure.md](../02-architecture/project-structure.md), không tách tuỳ hứng.

## Nguyên tắc chung khi viết code nghiệp vụ

Nhắc lại các nguyên tắc đã áp dụng xuyên suốt thiết kế — giữ nhất quán khi code:

- **YAGNI** — không viết code cho tính năng chưa cần (đã áp dụng khi bỏ bảng `Product`, bỏ `POLL_MAX_ATTEMPTS` dư thừa...).
- **`server/services` không phụ thuộc React/Next.js/BullMQ trực tiếp** — chỉ nhận tham số, trả dữ liệu, gọi `providers`/`db`. Xem [project-structure.md](../02-architecture/project-structure.md) mục "Quy tắc phụ thuộc".
- **`server/trpc/routers` chỉ validate + gọi service** — không chứa logic nghiệp vụ.
- **Không hardcode giá trị có thể đổi** — đưa vào biến môi trường (đã làm với `SPY_MAX_PRODUCTS`, `POLL_*`...), nhưng cũng không tạo biến môi trường cho thứ không ai đọc (đã bỏ ý định làm vậy với "sold_count luỹ kế" — xem [external-spy-api.md](../04-integration/external-spy-api.md)).

## Commit & nhánh

Xem [git-branching.md](git-branching.md).
