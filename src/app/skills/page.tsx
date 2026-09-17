import { EmptyState, SkillsOutput } from "@/src/components/portfolio/Content";
import { getSkills } from "@/src/lib/data";

export const revalidate = 3600;

export default async function SkillsPage() {
  const skills = await getSkills();
  return <><p className="output-intro">/skills - the tools and practices behind the work.</p>{skills.length ? <SkillsOutput skills={skills} /> : <EmptyState message="no published skills found." />}</>;
}
