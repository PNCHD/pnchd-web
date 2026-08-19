import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set (see .env.example)',
  )
}

/**
 * Typed against the real schema. `database.types.ts` is generated — regenerate
 * after any migration:
 *
 *   supabase gen types typescript --project-id <ref> \
 *     > pnchd-web/src/types/database.types.ts
 *
 * This is what makes a column rename a compile error instead of a runtime
 * surprise, and it's why repositories can select explicit columns without
 * losing inference.
 */
export type TypedSupabaseClient = SupabaseClient<Database>

export const supabase: TypedSupabaseClient = createClient<Database>(url, anonKey)
