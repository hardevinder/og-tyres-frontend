"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* HERO */}
      <section className="border-b border-[#f7c25a]/10">
        <div className="mx-auto max-w-6xl px-4 py-14">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-1 text-xs font-semibold text-[#f7c25a]">
                <span className="h-2 w-2 rounded-full bg-[#f7c25a]" />
                Contact • OG Tyres & Rims
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                Get in touch with{" "}
                <span className="bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] bg-clip-text text-transparent">
                  OG Tyres & Rims
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                Looking for the right tyre for your vehicle? Contact our team for
                guidance on tyre sizes, fitment options, and product availability.
                We are happy to help you choose the best option for your driving
                needs.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
            >
              Browse Products →
            </Link>

          </div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="mx-auto max-w-6xl px-4 py-14">

        <div className="grid gap-6 md:grid-cols-2">

          {/* PHONE */}
          <div className="rounded-3xl border border-[#f7c25a]/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#f7c25a]/15 p-4 text-[#f7c25a]">
                <Phone className="h-6 w-6" />
              </div>

              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-[#f7c25a]">
                  Phone
                </div>

                <div className="mt-2 text-xl font-extrabold">
                  +91 60471 23870
                </div>

                <p className="mt-2 text-sm text-white/70">
                  Call us for product availability, tyre size guidance,
                  and purchase assistance.
                </p>

                <div className="mt-4 text-xs text-white/50">
                  Available during working hours.
                </div>
              </div>
            </div>

          </div>

          {/* EMAIL */}
          <div className="rounded-3xl border border-[#f7c25a]/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#f7c25a]/15 p-4 text-[#f7c25a]">
                <Mail className="h-6 w-6" />
              </div>

              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-[#f7c25a]">
                  Email
                </div>

                <div className="mt-2 text-xl font-extrabold">
                  ogtiresandrims@gmail.com
                </div>

                <p className="mt-2 text-sm text-white/70">
                  Send us your tyre requirement and vehicle details. Our team
                  will guide you with the best available options.
                </p>

                <div className="mt-4 text-xs text-white/50">
                  Email responses are usually provided within working hours.
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* HOURS */}
        <div className="mt-6 rounded-3xl border border-[#f7c25a]/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">

          <div className="flex items-start gap-4">

            <div className="rounded-2xl bg-[#f7c25a]/15 p-4 text-[#f7c25a]">
              <Clock className="h-6 w-6" />
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#f7c25a]">
                Working Hours
              </div>

              <div className="mt-2 text-lg font-extrabold">
                9:00 AM – 7:00 PM
              </div>

              <p className="mt-2 text-sm text-white/70">
                Our team is available during business hours to assist customers
                with tyre selection, fitment information, and purchase inquiries.
              </p>
            </div>

          </div>

        </div>

        {/* EXTRA TEXT */}
        <div className="mt-10 max-w-3xl text-sm leading-7 text-white/65">
          OG Tyres & Rims is committed to providing customers with reliable tyre
          options suited for everyday driving as well as performance needs.
          Whether you are searching for a specific tyre size or exploring
          different categories, our team is ready to guide you toward the best
          choice for your vehicle.
        </div>

      </section>
    </div>
  );
}