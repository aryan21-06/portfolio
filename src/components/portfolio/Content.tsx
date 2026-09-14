import Image from "next/image";
import Link from "next/link";
import type { About, Blog, Experience, Project, Skill } from "@/src/lib/types";
import { projectMedia } from "@/src/lib/project-media";
import CopyLinkButton from "@/src/components/portfolio/CopyLinkButton";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label"><span>{"//"}</span>{children}</div>;
}

export function DirectoryOutput() {
  return <div className="directory-list"><Link href="/about"><span>./</span>about/</Link><Link href="/skills"><span>./</span>skills/</Link><Link href="/projects"><span>./</span>projects/</Link><Link href="/experience"><span>./</span>experience/</Link><Link href="/blogs"><span>./</span>blogs/</Link><Link href="/resume"><span>./</span>resume</Link></div>;
}

export function AboutOutput({ about }: { about: About | null }) {
  if (!about) return <EmptyState message="about data is not available." />;
  return <div className="about-output"><div className="about-avatar" aria-hidden="true">{about.displayName.charAt(0)}<span>.</span></div><div className="about-copy"><p className="output-intro">{about.shortBio}</p><p>{about.longBio}</p><div className="about-meta"><span>{about.location} / {about.timezone}</span><span className="availability"><i />{about.availability.label}</span></div><div className="inline-links"><a href={`mailto:${about.email}`}>email <span aria-hidden="true">-&gt;</span></a>{about.socialLinks.map((link) => <a href={link.url} key={link.label} target="_blank" rel="noreferrer">{link.label.toLowerCase()} <span aria-hidden="true">-&gt;</span></a>)}</div></div></div>;
}

export function SkillsOutput({ skills }: { skills: Skill[] }) {
  return <div className="skills-list">{skills.map((skill, index) => <div className="skill-row" key={skill.id}><span className="dim">{String(index + 1).padStart(2, "0")}</span><strong>{skill.name}</strong><span>{skill.category}</span><small>{skill.tools.join(" / ")}</small></div>)}</div>;
}

export function ExperienceOutput({ entries }: { entries: Experience[] }) {
  return <div className="experience-list">{entries.map((entry) => <article className="experience-item" key={entry.id}><div className="experience-date">{formatPeriod(entry.startDate, entry.endDate)}</div><div><h3>{entry.role} <span>/ {entry.company}</span></h3><p>{entry.summary}</p><ul>{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul><div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>)}</div>;
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.id}>{projectMedia[project.slug] && <Image className="project-image" src={projectMedia[project.slug]} alt={`${project.title} project screenshot`} width={900} height={500}  /> }<div className="project-top"><span className="dim">{String(index + 1).padStart(2, "0")}</span><span className="card-arrow" aria-hidden="true">-&gt;</span></div><h3>{project.title}</h3><p>{project.summary}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a className="text-action" href={`/projects/${project.slug}`}>read project <span aria-hidden="true">-&gt;</span></a></article>)}</div>;
}

export function ProjectDetail({ project }: { project: Project }) {
  const image = projectMedia[project.slug];
  return <article className="detail-output">{image && <Image className="detail-image" src={image} alt={`${project.title} project screenshot`} width={1200} height={680} priority /> }<div className="detail-kicker"><span>PROJECT</span><span>{project.role}</span></div><h2>{project.title}</h2><p className="detail-lede">{project.summary}</p><ContentText content={project.content} /><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{project.links.length > 0 && <div className="detail-actions">{project.links.map((link) => <a href={link} key={link} target="_blank" rel="noreferrer">{linkLabel(link)} <span aria-hidden="true">-&gt;</span></a>)}</div>}</article>;
}

export function BlogList({ blogs }: { blogs: Blog[] }) {
  return <div className="blog-list">{blogs.map((blog) => <a className="blog-row" key={blog.id} href={`/blogs/${blog.slug}`}><span className="blog-date">{formatDate(blog.publishedAt)}</span><strong>{blog.title}</strong><span className="blog-meta">{blog.tags[0]} / {blog.readingTimeMinutes} min read</span><span className="card-arrow" aria-hidden="true">-&gt;</span></a>)}</div>;
}

export function BlogDetail({ blog }: { blog: Blog }) {
  return <article className="article-output"><div className="detail-kicker"><span>{blog.tags.join(" / ")}</span><span>{formatDate(blog.publishedAt)} / {blog.readingTimeMinutes} MIN</span></div><h2>{blog.title}</h2><p className="detail-lede">{blog.excerpt}</p><div className="article-body"><ContentText content={blog.content} /></div><div className="article-footer"><span>Thanks for reading.</span><CopyLinkButton /></div></article>;
}

export function ResumeOutput({ about, skills, experience, projects }: { about: About | null; skills: Skill[]; experience: Experience[]; projects: Project[] }) {
  return <div className="resume-output"><div className="resume-heading"><span>{about?.handle ?? "PORTFOLIO"} / OVERVIEW</span><span>SCREENING VIEW</span></div><h2>{about?.headline ?? "Full-stack developer building useful software."}</h2><div className="resume-columns"><div><SectionLabel>core skills</SectionLabel><p>{skills.slice(0, 4).map((skill) => <span key={skill.id}>{skill.name}<br /></span>)}</p></div><div><SectionLabel>currently</SectionLabel><p>{about?.currentlyWorkingOn ?? "Building useful software."}<br />{about?.location}<br /><span className="online-dot" /> {about?.availability.label}</p></div><div><SectionLabel>contact</SectionLabel><p>{about && <><a href={`mailto:${about.email}`}>{about.email}</a><br />{about.socialLinks.map((link) => <a href={link.url} key={link.label} target="_blank" rel="noreferrer">{link.label}<br /></a>)}</>}</p></div></div><SectionLabel>experience</SectionLabel><ExperienceOutput entries={experience} /><SectionLabel>selected projects</SectionLabel><div className="resume-projects">{projects.map((project) => <a href={`/projects/${project.slug}`} key={project.id}><strong>{project.title}</strong><span>{project.summary}</span></a>)}</div></div>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="empty-state">{message}</p>;
}

function ContentText({ content }: { content: string }) {
  return <>{content.split(/\n\n+/).filter(Boolean).map((block) => { const clean = block.trim(); if (clean.startsWith("# ")) return <h3 key={block}>{clean.slice(2)}</h3>; if (clean.startsWith("- ")) return <ul key={block}>{clean.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>; return <p key={block}>{clean}</p>; })}</>;
}

function formatPeriod(start: string, end: string | null) {
  return `${formatMonth(start)} - ${end ? formatMonth(end) : "NOW"}`;
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

function formatDate(value: unknown) {
  const date = typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function" ? value.toDate() : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "DATE UNKNOWN";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
}

function linkLabel(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "open link"; }
}
