import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';

const staff = { id: 'one', email: 'staff@example.test', displayName: 'แอดมิน', role: 'admin' } as const;
const player = { ...staff, id: 'two', role: 'user' } as const;

async function access() {
  const policy = new URL('../../src/auth/access.ts', import.meta.url);
  expect(existsSync(policy), 'The admin portal must resolve access from the active account role').toBe(true);
  return await import(policy.href) as typeof import('../../src/auth/access.ts');
}

test('a current admin session grants access', async () => {
  const { resolveAdminAccess } = await access();
  expect(resolveAdminAccess(staff)).toEqual({ status: 'allowed', user: staff });
});

test('an authenticated user without the admin role is forbidden', async () => {
  const { resolveAdminAccess } = await access();
  expect(resolveAdminAccess(player)).toEqual({ status: 'forbidden', user: player });
});

test('an expired or absent session requires login', async () => {
  const { resolveAdminAccess } = await access();
  expect(resolveAdminAccess(null)).toEqual({ status: 'signed-out' });
});
