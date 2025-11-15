"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

type Blog = {
  id: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  slug: string;
  content: string;
};

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetch("/data/blogs.json")
      .then((res) => res.json())
      .then((data: Blog[]) => {
        const found = data.find((b) => b.slug === slug);
        setBlog(found || null);
      });
  }, [slug]);

  if (!blog) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <>
      <BreadcrumbBanner
        title={blog.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blogs", href: "/blogs" },
          { label: blog.title },
        ]}
        background={blog.image}
      />

      <section className="w-full bg-white py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#506600] mb-6">
            {blog.title}
          </h1>

          <div className="clearfix">
            {/* ✅ Floated Image */}
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full md:w-1/2 h-auto object-cover rounded-2xl shadow-lg mb-6 md:mb-4 md:mr-6 float-none md:float-left"
            />

            {/* ✅ Wrapped Content (left aligned) */}
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {blog.content}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
