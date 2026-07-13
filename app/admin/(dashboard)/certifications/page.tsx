import { createClient } from '@/lib/supabase/server';
import CertificationsManager from '@/components/admin/CertificationsManager';

export default async function AdminCertificationsPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <>
      <h1>Certifications</h1>
      <CertificationsManager initialItems={items ?? []} />
    </>
  );
}
