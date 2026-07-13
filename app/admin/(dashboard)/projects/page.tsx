import { createClient } from '@/lib/supabase/server';
import ProjectsManager from '@/components/admin/ProjectsManager';

export default async function AdminProjectsPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      <h1>Projects</h1>
      <ProjectsManager initialItems={items ?? []} />
    </>
  );
}
