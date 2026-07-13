export interface Profile {
  id: string;
  name: string;
  tagline: string | null;
  resume_url: string | null;
  photo_url: string | null;
  banner_url: string | null;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  badge: string | null;
  show_in_header: boolean;
  display_order: number;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  start_date: string; // 'YYYY-MM' or free text like "Jan 2026"
  end_date: string | null; // null = "Present"
  bullets: string[];
  display_order: number;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  details: string | null; // e.g. "Graduated 2026 · CGPA 8.0"
  display_order: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string | null;
  date: string | null;
  url: string | null;
  display_order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  live_url: string | null;
  display_order: number;
}
