import { createClient } from '@/lib/supabase/server';
import PublicHeader from '@/components/PublicHeader';
import ProjectsSection from '@/components/ProjectsSection';
import LinksSection from '@/components/LinksSection';
import ExperienceSection from '@/components/ExperienceSection';
import EducationSection from '@/components/EducationSection';
import CertificationsSection from '@/components/CertificationsSection';

// Always fetch fresh data — content changes from the admin panel should
// show up immediately for visitors, not a stale cached build.
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  const [profileRes, linksRes, projectsRes, experienceRes, educationRes, certsRes] =
    await Promise.all([
      supabase.from('profile').select('*').limit(1).maybeSingle(),
      supabase.from('links').select('*').order('display_order', { ascending: true }),
      supabase.from('projects').select('*').order('display_order', { ascending: true }),
      supabase.from('experience').select('*').order('display_order', { ascending: true }),
      supabase.from('education').select('*').order('display_order', { ascending: true }),
      supabase.from('certifications').select('*').order('display_order', { ascending: true }),
    ]);

  return (
    <main>
      <PublicHeader profile={profileRes.data} links={linksRes.data ?? []} />
      <div className="wrap">
        <ProjectsSection projects={projectsRes.data ?? []} />
        <LinksSection links={linksRes.data ?? []} />
        <ExperienceSection items={experienceRes.data ?? []} />
        <EducationSection items={educationRes.data ?? []} />
        <CertificationsSection items={certsRes.data ?? []} />
      </div>
    </main>
  );
}
