import { createClient } from '@/lib/supabase/server';
import EducationManager from '@/components/admin/EducationManager';

export default async function AdminEducationPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('education')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      <h1>Education</h1>
      <EducationManager initialItems={items ?? []} />
    </>
  );
}
