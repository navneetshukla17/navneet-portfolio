import { DocIcon, LinkedInIcon, GitHubIcon, LinkIcon } from './Icons';
import type { Profile, LinkItem } from '@/lib/types';

function iconFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes('linkedin')) return <LinkedInIcon />;
  if (l.includes('github')) return <GitHubIcon />;
  return <LinkIcon />;
}

export default function PublicHeader({
  profile,
  links,
}: {
  profile: Profile | null;
  links: LinkItem[];
}) {
  const name = profile?.name ?? 'Your Name';
  const tagline = profile?.tagline ?? '';
  const headerLinks = links.filter((l) => l.show_in_header);

  return (
    <>
      {profile?.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="banner" src={profile.banner_url} alt="" />
      ) : (
        <div className="banner-placeholder" />
      )}

      <div className="wrap">
        <div className="header-content">
          <div className="avatar-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="avatar"
              src={profile?.photo_url ?? '/avatar-placeholder.png'}
              alt={name}
            />
          </div>

          <div className="name-block">
            <h1 className="name">{name}</h1>
            {tagline && <p className="tagline">{tagline}</p>}

            <div className="links-row">
              {profile?.resume_url && (
                <a className="link-item" href={profile.resume_url} target="_blank" rel="noreferrer">
                  <DocIcon /> Resume
                </a>
              )}
              {headerLinks.map((link) => (
                <a
                  key={link.id}
                  className="link-item"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {iconFor(link.label)} {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
