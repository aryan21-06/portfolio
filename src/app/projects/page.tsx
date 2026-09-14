import { EmptyState, ProjectList } from "@/src/components/portfolio/Content";
import { getProjects } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <><p className="output-intro">/projects - selected work, experiments, and systems.</p>{projects.length ? <ProjectList projects={projects} /> : <EmptyState message="no published projects found." />}</>;
}
