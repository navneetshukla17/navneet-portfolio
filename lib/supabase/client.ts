import { createBrowserClient } from '@supabase/ssr';

// Used in Client Components (the admin panel forms, crop-uploader, etc.)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
