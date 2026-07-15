import { DocIcon } from './Icons';
import PdfThumbnail from './PdfThumbnail';
import type { ProjectItem } from '@/lib/types';

export default function ProjectsSection({ projects }: { projects: ProjectItem[] }) {
  return (
    <section className="section">
      <h2>Projects</h2>
      {projects.length === 0 ? (
        <div className="empty-state">No projects added yet — add them from the admin panel.</div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <a
              href={p.pdf_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="project-card-link"
              key={p.id}
            >
              <div className="project-card">
                <div className="project-thumb">
                  {p.pdf_url ? (
                    <PdfThumbnail pdfUrl={p.pdf_url} fallbackIcon={<DocIcon />} />
                  ) : (
                    <DocIcon />
                  )}
                </div>
                <div className="project-body">
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
