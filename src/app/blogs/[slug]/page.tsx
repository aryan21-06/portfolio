import { notFound } from "next/navigation";
import { BlogDetail } from "@/src/components/portfolio/Content";
import { getBlogBySlug } from "@/src/lib/data";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  return <BlogDetail blog={blog} />;
}
