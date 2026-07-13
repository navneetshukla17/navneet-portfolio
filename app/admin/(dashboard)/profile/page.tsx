import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/admin/ProfileForm';

export default async function AdminProfilePage() {
  const supabase = createClient();
  const { data: profile } = await supabase.from('profile').select('*').limit(1).maybeSingle();

  return (
    <>
      <h1>Profile &amp; Banner</h1>
      <ProfileForm profile={profile} />
    </>
  );
}
