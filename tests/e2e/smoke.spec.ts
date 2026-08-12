import { test, expect } from '@playwright/test';

test('참가자용 홈에는 이벤트 목록만 보이고 관리자 진입을 노출하지 않는다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /.+의 이벤트/ })).toBeVisible();
  await expect(page.getByRole('link', { name: '관리자 로그인' })).toHaveCount(0);
});

test('비로그인 사용자는 관리자 페이지에서 로그인으로 이동한다', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
