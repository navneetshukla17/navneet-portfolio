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
            <div className="project-card" key={p.id}>
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
                <div className="project-links">
                  {p.pdf_url && <a href={`/project/${p.id}`}>View PRD</a>}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer">
                      View Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
