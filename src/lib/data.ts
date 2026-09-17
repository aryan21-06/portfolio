import "server-only";
import { getAdminDb } from "@/src/lib/firebase/admin";
import type { About, Blog, Experience, Project, Skill } from "@/src/lib/types";

async function getCollection<T>(collection: string) {
  const snapshot = await getAdminDb().collection(collection).get();
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as T);
}

function published<T extends { status: string; order?: number }>(items: T[]) {
  return items
    .filter((item) => item.status === "published")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getAbout(): Promise<About | null> {
  const document = await getAdminDb().doc("site/about").get();
  return document.exists ? (document.data() as About) : null;
}

export async function getSkills() {
  return published(await getCollection<Skill>("skills"));
}

export async function getExperience() {
  return published(await getCollection<Experience>("experience"));
}

export async function getProjects() {
  return published(await getCollection<Project>("projects"));
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getBlogs() {
  return published(await getCollection<Blog>("blogs"));
}

export async function getBlogBySlug(slug: string) {
  const blogs = await getBlogs();
  return blogs.find((blog) => blog.slug === slug) ?? null;
}
