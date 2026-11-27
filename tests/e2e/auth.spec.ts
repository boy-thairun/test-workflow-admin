import { expect, test, type Page } from '@playwright/test';
import fixtures from '@test-workflow/virtual-room-contracts/fixtures/rest' with { type: 'json' };

type Role = 'admin' | 'user';

async function authFixture(page: Page, role: Role, current: Role | null = null) {
  const user = { ...fixtures.loginSuccess.user, role };
  let signedIn = current !== null;
  const calls: string[] = [];
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    calls.push(path);
    if (path.endsWith('/login')) {
      const input = route.request().postDataJSON();
      signedIn = input.email === fixtures.loginRequest.email && input.password === fixtures.loginRequest.password;
      await route.fulfill(signedIn ? { json: { user } } : { status: 401, json: fixtures.invalidCredentials });
    } else if (path.endsWith('/me')) {
      await route.fulfill(signedIn ? { json: { user } } : { status: 401, json: fixtures.expiredSession });
    } else if (path.endsWith('/logout')) {
      signedIn = false;
      await route.fulfill({ status: 204 });
    } else {
      await route.abort();
    }
  });
  return calls;
}

async function logIn(page: Page, password = fixtures.loginRequest.password) {
  await page.getByLabel('อีเมล').fill(fixtures.loginRequest.email);
  await page.getByLabel('รหัสผ่าน').fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
}

test('admin login opens users and refresh retains access', async ({ page }) => {
  await authFixture(page, 'admin');
  await page.goto('/users');
  await logIn(page);
  await expect(page.getByRole('heading', { name: 'จัดการผู้ใช้' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'จัดการผู้ใช้' })).toBeVisible();
});

test('a signed-in player cannot open the users page or request the user list', async ({ page }) => {
  const calls = await authFixture(page, 'user', 'user');
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'ไม่มีสิทธิ์เข้าหน้าจัดการ' })).toBeVisible();
  expect(calls).toEqual(['/api/v1/auth/me']);
});

test('expired sessions, invalid credentials, and logout return to login', async ({ page }) => {
  await authFixture(page, 'admin');
  await page.goto('/users');
  await expect(page).toHaveURL(/\/login$/);
  await logIn(page, 'wrong');
  await expect(page.getByRole('alert')).toHaveText('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  await logIn(page);
  await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
