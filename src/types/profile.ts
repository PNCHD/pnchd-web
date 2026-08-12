/** Mirrors the `role` check constraint on `profiles` (migration 001). */
export const PROFILE_ROLES = [
  'owner',
  'pro',
  'client',
  'driver',
  'platform_admin',
] as const

export type ProfileRole = (typeof PROFILE_ROLES)[number]

export interface Profile {
  id: string
  organizationId: string | null
  role: ProfileRole
  fullName: string | null
  avatarUrl: string | null
  phone: string | null
  isActive: boolean
}

interface ProfileRow {
  id: string
  organization_id: string | null
  role: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  is_active: boolean | null
}

function isProfileRole(value: string): value is ProfileRole {
  return (PROFILE_ROLES as readonly string[]).includes(value)
}

export function mapProfile(row: ProfileRow): Profile {
  if (!isProfileRole(row.role)) {
    throw new Error(`Unknown profile role: ${row.role}`)
  }
  return {
    id: row.id,
    organizationId: row.organization_id,
    role: row.role,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    isActive: row.is_active ?? true,
  }
}
