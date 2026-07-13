import { createClient } from '@/lib/supabase/server';
import LinksManager from '@/components/admin/LinksManager';

export default async function AdminLinksPage() {
  const supabase = createClient();
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      <h1>Links</h1>
      <LinksManager initialLinks={links ?? []} />
    </>
  );
}
