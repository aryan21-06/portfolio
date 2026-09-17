import { notFound } from "next/navigation";
import { ProjectDetail } from "@/src/components/portfolio/Content";
import { getProjectBySlug, getProjects } from "@/src/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
