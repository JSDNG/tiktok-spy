import { type ChildProcess, spawn } from 'node:child_process';
import { expect, test } from '@playwright/test';

let worker: ChildProcess;

test.beforeAll(async () => {
  worker = spawn('npx', ['tsx', 'worker.ts'], {
    env: { ...process.env, USE_MOCK_SPY_PROVIDER: 'true' },
    stdio: 'pipe',
  });
  await new Promise<void>((resolve) => {
    worker.stdout?.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('Worker started')) resolve();
    });
  });
});

test.afterAll(() => {
  worker.kill();
});

test('user spies a keyword and sees it appear in history and detail', async ({ page }) => {
  const keyword = `hoodie-e2e-${Date.now()}`;

  await page.goto('/');
  await page.getByPlaceholder('Từ khoá').fill(keyword);
  await page.getByRole('button', { name: 'Spy' }).click();

  await page.waitForURL(/\/tasks\/.+/);

  // Sidebar tự poll (FR-07) — chờ đúng mục vừa tạo chuyển sang SUCCEEDED,
  // scope theo keyword vì lịch sử có thể có nhiều task khác cùng trạng thái.
  const sidebarItem = page.getByRole('link', { name: new RegExp(keyword) });
  await expect(sidebarItem).toContainText('SUCCEEDED', { timeout: 15_000 });

  await expect(page.getByRole('table')).toBeVisible();
});
