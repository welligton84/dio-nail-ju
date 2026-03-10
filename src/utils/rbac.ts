import type { User } from '../types';

const ADMIN_ROLES = ['admin', 'administrador'];

/**
 * Checks if a user has admin privileges (case-insensitive).
 * Centralizes the admin check logic to avoid scattered hardcoded comparisons.
 */
export function isAdmin(user: User | null | undefined): boolean {
    if (!user?.role) return false;
    return ADMIN_ROLES.includes(user.role.toLowerCase());
}
