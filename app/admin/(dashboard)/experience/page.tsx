import { createClient } from '@/lib/supabase/server';
import ExperienceManager from '@/components/admin/ExperienceManager';

export default async function AdminExperiencePage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('experience')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      <h1>Experience</h1>
      <ExperienceManager initialItems={items ?? []} />
    </>
  );
}
