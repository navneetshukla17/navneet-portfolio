import type { CertificationItem } from '@/lib/types';

export default function CertificationsSection({ items }: { items: CertificationItem[] }) {
  return (
    <section className="section" style={{ paddingBottom: 'var(--xl)' }}>
      <h2>Certifications</h2>
      {items.length === 0 ? (
        <div className="empty-state">No certifications added yet — add them from the admin panel.</div>
      ) : (
        <div className="links-grid">
          {items.map((item) => {
            const card = (
              <div className="pub-card" key={item.id}>
                {item.issuer && <span className="pub-badge">{item.issuer}</span>}
                <h3>{item.name}</h3>
                {item.date && <span className="domain">{item.date}</span>}
              </div>
            );
            return item.url ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                {card}
              </a>
            ) : (
              card
            );
          })}
        </div>
      )}
    </section>
  );
}
