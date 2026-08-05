import { test, expect } from '@playwright/test';

test('홈에서 관리자 로그인 링크를 보여준다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '관리자 로그인' })).toBeVisible();
});

test('비로그인 사용자는 관리자 페이지에서 로그인으로 이동한다', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
