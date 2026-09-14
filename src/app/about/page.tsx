import { AboutOutput } from "@/src/components/portfolio/Content";
import { getAbout } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  return <AboutOutput about={await getAbout()} />;
}
