import type { EducationItem } from '@/lib/types';

export default function EducationSection({ items }: { items: EducationItem[] }) {
  return (
    <section className="section">
      <h2>Education</h2>
      {items.length === 0 ? (
        <div className="empty-state">No education added yet — add it from the admin panel.</div>
      ) : (
        <div className="timeline">
          {items.map((item) => (
            <div className="entry" key={item.id}>
              <div className="entry-marker">
                <div className="entry-dot" />
                <div className="entry-line" />
              </div>
              <div className="entry-content">
                <h3>{item.degree}</h3>
                <div className="entry-company">{item.institution}</div>
                {item.details && <div className="entry-dates">{item.details}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
