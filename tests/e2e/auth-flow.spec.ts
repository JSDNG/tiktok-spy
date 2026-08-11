import { expect, test } from '@playwright/test';

test('user registers, logs in, creates a spy task, and logs out', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto('/register');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Mật khẩu').fill('Password123');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Mật khẩu').fill('Password123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');

  await page.getByPlaceholder('Từ khoá').fill('hoodie');
  await page.getByRole('button', { name: 'Spy' }).click();
  await page.waitForURL(/\/tasks\/.+/);
  await expect(page.getByRole('link', { name: /hoodie/ })).toBeVisible();

  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});
