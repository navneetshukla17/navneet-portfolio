import type { LinkItem } from '@/lib/types';

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function LinksSection({ links }: { links: LinkItem[] }) {
  return (
    <section className="section">
      <h2>Publications &amp; Links</h2>
      {links.length === 0 ? (
        <div className="empty-state">No links added yet — add them from the admin panel.</div>
      ) : (
        <div className="links-grid">
          {links.map((link) => (
            <a
              className="pub-card"
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {link.badge && <span className="pub-badge">{link.badge}</span>}
              <h3>{link.label}</h3>
              <span className="domain">{domainOf(link.url)}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
