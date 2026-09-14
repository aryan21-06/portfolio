import { BlogList, EmptyState } from "@/src/components/portfolio/Content";
import { getBlogs } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getBlogs();
  return <><p className="output-intro">/blogs - notes from the workshop.</p>{blogs.length ? <BlogList blogs={blogs} /> : <EmptyState message="no published writing found." />}</>;
}
