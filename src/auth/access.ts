import { type User } from './client.ts';

export type AdminAccess =
  | { status: 'signed-out' }
  | { status: 'allowed' | 'forbidden'; user: User };

export function resolveAdminAccess(user: User | null): AdminAccess {
  if (!user) return { status: 'signed-out' };
  return { status: user.role === 'admin' ? 'allowed' : 'forbidden', user };
}
