import Link from 'next/link';

const SECTIONS = [
  { href: '/admin/profile', label: 'Profile & Banner', desc: 'Name, tagline, resume, profile photo, banner image' },
  { href: '/admin/links', label: 'Links', desc: 'LinkedIn, GitHub, and any other links' },
  { href: '/admin/projects', label: 'Projects', desc: 'Project cards with PRD/deck PDFs and live links' },
  { href: '/admin/experience', label: 'Experience', desc: 'Work history timeline' },
  { href: '/admin/education', label: 'Education', desc: 'Degrees and institutions' },
  { href: '/admin/certifications', label: 'Certifications', desc: 'Certifications and badges' },
];

export default function AdminOverviewPage() {
  return (
    <>
      <h1>Admin</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--md)' }}>
        Everything here updates the live site immediately.
      </p>
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="admin-list-item"
          style={{ textDecoration: 'none', color: 'var(--text)' }}
        >
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif", marginBottom: '4px' }}>{s.label}</div>
            <div className="meta">{s.desc}</div>
          </div>
          <span style={{ color: 'var(--text-faint)' }}>→</span>
        </Link>
      ))}
    </>
  );
}
