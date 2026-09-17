import { notFound } from "next/navigation";
import { BlogDetail } from "@/src/components/portfolio/Content";
import { getBlogBySlug, getBlogs } from "@/src/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  const blogs = await getBlogs();

  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  return <BlogDetail blog={blog} />;
}
