import { notFound } from "next/navigation";
import { ProjectDetail } from "@/src/components/portfolio/Content";
import { getProjectBySlug } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
