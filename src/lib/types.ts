export type Status = "published" | "draft";

export type SocialLink = {
  label: string;
  url: string;
};

export type About = {
  displayName: string;
  handle: string;
  headline: string;
  shortBio: string;
  longBio: string;
  location: string;
  timezone: string;
  availability: { status: string; label: string };
  email: string;
  avatarUrl: string;
  socialLinks: SocialLink[];
  interests: string[];
  currentlyWorkingOn: string;
  resumeUrl: string;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  tools: string[];
  featured: boolean;
  status: Status;
  order: number;
};

export type Experience = {
  id: string;
  slug: string;
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  highlights: string[];
  tags: string[];
  status: Status;
  order: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  role: string;
  tags: string[];
  links: string[];
  imageUrl: string;
  featured: boolean;
  status: Status;
  order: number;
};

export type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  isTech: boolean;
  readingTimeMinutes: number;
  coverImageUrl: string;
  publishedAt: unknown;
  status: Status;
  order: number;
  seo: { title: string; description: string };
};
