"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

type Blog = {
  id: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  slug: string;
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    // ✅ Load blog data dynamically from JSON
    fetch("/data/blogs.json")
      .then((res) => res.json())
      .then((data) => setBlogs(data));
  }, []);

  return (
    <>
      {/* ✅ Breadcrumb Banner */}
      <BreadcrumbBanner
        title="Our Blogs"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
        background="/blog-banner.jpg"
      />

      <section className="w-full bg-[#f9faf6] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#506600] mb-4">
              Latest Articles & Insights
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore Ayurvedic wisdom, lifestyle tips, and natural remedies for holistic wellness.  
            </p>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden flex flex-col"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-52 object-cover"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-sm font-medium text-green-600 mb-2">
                    {blog.category}
                  </span>
                  <h3 className="text-xl font-semibold text-[#506600] mb-3">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {blog.excerpt}
                  </p>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-[#506600] hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
