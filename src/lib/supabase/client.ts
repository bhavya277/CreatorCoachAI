import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

// Client-side browser Supabase instance
export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a dummy/noop client or null when not configured
    return createBrowserClient(
      supabaseUrl || 'https://mylvfsawgobqxfqoqtcg.supabase.co',
      supabaseAnonKey || 'sb_publishable_TdjfVEOWN9ZlVOBhC3XkDg_x56mjnev'
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
