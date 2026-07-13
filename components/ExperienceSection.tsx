import type { ExperienceItem } from '@/lib/types';

export default function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <section className="section">
      <h2>Work Experience</h2>
      {items.length === 0 ? (
        <div className="empty-state">No experience added yet — add it from the admin panel.</div>
      ) : (
        <div className="timeline">
          {items.map((item) => (
            <div className="entry" key={item.id}>
              <div className="entry-marker">
                <div className="entry-dot" />
                <div className="entry-line" />
              </div>
              <div className="entry-content">
                <h3>{item.role}</h3>
                <div className="entry-company">{item.company}</div>
                <div className="entry-dates">
                  {item.start_date} – {item.end_date ?? 'Present'}
                </div>
                {item.bullets?.length > 0 && (
                  <ul className="entry-bullets">
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
