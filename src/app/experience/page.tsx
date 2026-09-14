import { EmptyState, ExperienceOutput } from "@/src/components/portfolio/Content";
import { getExperience } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const experience = await getExperience();
  return <><p className="output-intro">/experience - a short version of the long story.</p>{experience.length ? <ExperienceOutput entries={experience} /> : <EmptyState message="no published experience found." />}</>;
}
