'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/profile', label: 'Profile & Banner' },
  { href: '/admin/links', label: 'Links' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/certifications', label: 'Certifications' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="admin-nav">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noreferrer" style={{ marginTop: 'var(--sm)' }}>
        View live site ↗
      </a>
      <button
        onClick={handleSignOut}
        style={{
          marginTop: 'auto',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-faint)',
          textAlign: 'left',
          padding: '10px 12px',
          fontSize: '14px',
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
