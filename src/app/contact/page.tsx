"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = useMemo(() => {
    return name.trim() && email.trim() && message.trim();
  }, [name, email, message]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-xs text-[#f7c25a]">
                <span className="h-2 w-2 rounded-full bg-[#f7c25a]" />
                Support • Demo
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
                Contact{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7c25a] to-[#d79b2b]">
                  OG Tires
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Ask about tyre sizes, availability, or pricing. Share size like 205/55R16 for faster help.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110 transition"
            >
              Browse Tyres →
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Info */}
          <div className="lg:col-span-5 space-y-4">
            {[
              { icon: Mail, title: "Email", value: "support@ogtires.com", note: "Reply within 24 hrs (demo)" },
              { icon: Phone, title: "Phone", value: "+91 00000 00000", note: "Mon–Sat • 9 AM – 7 PM" },
              { icon: MapPin, title: "Address", value: "Your City, India", note: "Google Maps integration later" },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#f7c25a]/15 p-3 text-[#f7c25a]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">{item.title}</div>
                    <div className="mt-1 text-sm text-white/80">{item.value}</div>
                    <div className="mt-2 text-xs text-white/50">{item.note}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 p-6 text-[#f7c25a]">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1" />
                <div>
                  <div className="text-sm font-extrabold">Quick Tip</div>
                  <div className="mt-1 text-sm text-white/80">
                    Mention your tyre size and vehicle type for accurate suggestions.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              {!sent ? (
                <>
                  <h2 className="text-xl font-extrabold">Send a message</h2>
                  <p className="mt-1 text-sm text-white/70">
                    Demo only — backend integration later.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name *"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#f7c25a]"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email *"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#f7c25a]"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#f7c25a]"
                    />
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
                    >
                      <option>General</option>
                      <option>Tyre Size Help</option>
                      <option>Bulk Purchase</option>
                      <option>Dealership</option>
                      <option>Report Issue</option>
                    </select>
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Write your message..."
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#f7c25a]"
                  />

                  <div className="mt-6 flex justify-end">
                    <button
                      disabled={!canSend}
                      onClick={() => setSent(true)}
                      className={`rounded-2xl px-6 py-3 text-sm font-extrabold transition ${
                        canSend
                          ? "bg-[#f7c25a] text-black hover:brightness-110"
                          : "bg-white/10 text-white/40 cursor-not-allowed"
                      }`}
                    >
                      Send Message
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7c25a]/20 text-[#f7c25a]">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold">Message sent (demo)!</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Thanks {name || "friend"}, we’ll connect real email sending soon.
                  </p>

                  <button
                    onClick={() => {
                      setSent(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setTopic("General");
                      setMessage("");
                    }}
                    className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                  >
                    Send Another
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-white/40">
              Premium demo UI — backend integration coming soon.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}