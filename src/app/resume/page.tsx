import { ResumeOutput } from "@/src/components/portfolio/Content";
import { getAbout, getExperience, getProjects, getSkills } from "@/src/lib/data";

export const revalidate = 3600;

export default async function ResumePage() {
  const [about, skills, experience, projects] = await Promise.all([getAbout(), getSkills(), getExperience(), getProjects()]);
  return <ResumeOutput about={about} skills={skills} experience={experience} projects={projects} />;
}
