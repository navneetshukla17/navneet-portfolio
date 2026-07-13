import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) notFound();

  return (
    <div className="wrap" style={{ paddingTop: 'var(--lg)', paddingBottom: 'var(--xl)' }}>
      <Link href="/" className="link-item" style={{ marginBottom: 'var(--md)', display: 'inline-flex' }}>
        ← Back to portfolio
      </Link>

      <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.06em', margin: '20px 0 10px' }}>
        {project.title}
      </h1>
      {project.description && (
        <p className="tagline" style={{ maxWidth: '760px', marginBottom: 'var(--md)' }}>
          {project.description}
        </p>
      )}

      <div className="links-row" style={{ marginBottom: 'var(--md)' }}>
        {project.pdf_url && (
          <a className="btn btn-primary" href={project.pdf_url} download>
            Download PDF
          </a>
        )}
        {project.live_url && (
          <a className="btn btn-ghost" href={project.live_url} target="_blank" rel="noreferrer">
            View Live ↗
          </a>
        )}
      </div>

      {project.pdf_url ? (
        <iframe className="pdf-embed" src={project.pdf_url} title={project.title} />
      ) : (
        <div className="empty-state">No PDF uploaded for this project yet.</div>
      )}
    </div>
  );
}
