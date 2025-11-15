"use client";

import Link from "next/link";

export default function BreadcrumbBanner({
  title,
  breadcrumbs,
  background = "/breadcrumb-bg.jpg", // 👉 default background
}: {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  background?: string;
}) {
  return (
    <section className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center">
      {/* Background Image */}
      <img
        src={background}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 !text-white">
          {title}
        </h1>
        <nav className="text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx}>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:underline !text-white">
                  {crumb.label}
                </Link>
              ) : (
                <span className="!text-white">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="mx-2 !text-white">/</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
