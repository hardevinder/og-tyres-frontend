"use client";

import { motion } from "framer-motion";
import {
  Droplet,
  Shirt,
  Clock,
  Leaf,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  ThumbsUp,
  Users,
  Award,
  Zap,
  Star,
} from "lucide-react";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

const features = [
  {
    icon: <Droplet size={40} />,
    title: "Premium Washing & Drying",
    desc: "Our state-of-the-art machines paired with hypoallergenic, premium detergents deliver spotless results while preserving fabric integrity and softness.",
  },
  {
    icon: <Clock size={40} />,
    title: "Rapid Turnaround",
    desc: "Efficiency is key. Choose from express same-day service or reliable next-day options, ensuring your wardrobe is refreshed without delay.",
  },
  {
    icon: <Leaf size={40} />,
    title: "Sustainable Practices",
    desc: "Committed to the planet, we employ low-water cycles, energy-efficient dryers, and plant-based detergents that safeguard both your garments and the environment.",
  },
  {
    icon: <ShieldCheck size={40} />,
    title: "Hygiene Excellence",
    desc: "Individual garment processing with steam sanitization at 140°F and tamper-evident packaging guarantees unparalleled cleanliness and safety.",
  },
  {
    icon: <Truck size={40} />,
    title: "Seamless Doorstep Service",
    desc: "Hassle-free convenience: Schedule pickups via app, and receive impeccably folded laundry delivered to your door, ready to wear.",
  },
  {
    icon: <ThumbsUp size={40} />,
    title: "Unwavering Quality",
    desc: "Rigorous multi-step inspections ensure every piece meets our exacting standards—crisp, fresh, and flawlessly presented.",
  },
];

const stats = [
  {
    icon: <Users size={48} />,
    number: "10K+",
    label: "Happy Customers",
  },
  {
    icon: <Award size={48} />,
    number: "5+",
    label: "Years of Excellence",
  },
  {
    icon: <Zap size={48} />,
    number: "99.9%",
    label: "On-Time Delivery",
  },
];

const testimonials = [
  {
    quote:
      "This service has transformed my busy routine—professional, eco-conscious, and always impeccable results!",
    author: "Sarah L., Marketing Executive",
    rating: 5,
  },
  {
    quote:
      "Reliable pickups, gentle care for delicates, and that fresh scent every time. Highly recommend!",
    author: "Raj Patel, Entrepreneur",
    rating: 5,
  },
  {
    quote:
      "From suits to linens, everything arrives wrinkle-free and pristine. True value for money.",
    author: "Emily Chen, Designer",
    rating: 5,
  },
];

const processSteps = [
  {
    step: 1,
    title: "Schedule Pickup",
    desc: "Book via our app or website—tell us your preferences and we'll handle the rest.",
  },
  {
    step: 2,
    title: "Expert Cleaning",
    desc: "Your items undergo our premium wash, sanitize, and fold process with care.",
  },
  {
    step: 3,
    title: "Quality Check",
    desc: "Each garment is inspected by our team for perfection before packaging.",
  },
  {
    step: 4,
    title: "Delivery",
    desc: "Receive your laundry neatly folded and delivered right to your doorstep.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Breadcrumb Banner */}
      <BreadcrumbBanner
        title="Elevate Your Laundry Experience"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Our Features" },
        ]}
        background="/laundry-features-banner.jpg"
      />

      <section className="w-full bg-gradient-to-br from-[#FFFDF8] to-[#F8F9FA] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#001f3f] mb-6 leading-tight">
              Redefining Clean with Precision and Care
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover a world where laundry is not just cleaned, but transformed. We
              blend cutting-edge technology, sustainable innovation, and meticulous
              attention to detail—delivering wardrobe perfection that fits seamlessly
              into your life.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-50 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-[#FFF1E6] to-[#FFE4D6] group-hover:scale-110 transition-transform duration-300 p-5 rounded-2xl mb-6">
                    <div className="text-[#EA580C]">{feature.icon}</div>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#001f3f] mb-4 group-hover:text-[#EA580C] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center"
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50"
              >
                <div className="text-[#EA580C] mb-4">{stat.icon}</div>
                <h3 className="text-4xl font-bold text-[#001f3f] mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Highlight Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mb-20 rounded-3xl overflow-hidden shadow-xl"
          >
            <img
              src="/laundry-process.jpg"
              alt="Sustainable Laundry Process"
              className="absolute inset-0 w-full h-[500px] md:h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/80 via-[#001f3f]/60 to-transparent" />
            <div className="relative z-10 p-8 md:p-16 text-center text-white max-w-4xl mx-auto">
           <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-white dark:text-white !text-white !dark:text-white">
            Immaculate Laundry, Impeccable Impact
          </h2>

              <p className="text-xl leading-relaxed text-white dark:text-white">
                Beyond superior cleaning, we're stewards of sustainability. Our
                closed-loop water systems and carbon-neutral operations ensure every
                load contributes to a healthier planet—without compromising on
                luxury.
              </p>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#001f3f] text-center mb-12">
              Voices of Our Valued Clients
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-[#EA580C] fill-[#EA580C]"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-semibold text-[#001f3f]">
                    {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#001f3f] text-center mb-12">
              Our Seamless 4-Step Journey
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {processSteps.map((step, idx) => (
                <div key={idx} className="text-center group">
                  <div className="bg-[#EA580C] text-white rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-[#001f3f] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Promise Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Sparkles className="mx-auto text-[#EA580C] h-16 w-16 mb-6" />
            <h2 className="text-4xl font-bold text-[#001f3f] mb-8">
              Our Ironclad Commitment
            </h2>
            <p className="max-w-4xl mx-auto text-xl text-gray-600 leading-relaxed">
              At the heart of our service is a dedication to excellence. From secure
              handling to bespoke care instructions, we treat every garment as if it
              were our own—delivering not just clean clothes, but confidence in every
              fold.
            </p>
          </motion.div>

          {/* Difference Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 mb-20 items-center"
          >
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-[#001f3f] mb-8">
                The Pinnacle of Laundry Distinction
              </h2>
              <ul className="space-y-6 text-lg text-gray-700">
                <li className="flex items-center">
                  <ShieldCheck className="h-6 w-6 text-[#EA580C] mr-3" />
                  Hypoallergenic Detergents &amp; Natural Softeners
                </li>
                <li className="flex items-center">
                  <Shirt className="h-6 w-6 text-[#EA580C] mr-3" />
                  Professional Steam Pressing for Wrinkle-Free Elegance
                </li>
                <li className="flex items-center">
                  <Truck className="h-6 w-6 text-[#EA580C] mr-3" />
                  Guaranteed 100% On-Time Collections and Returns
                </li>
                <li className="flex items-center">
                  <Heart className="h-6 w-6 text-[#EA580C] mr-3" />
                  Transparent, Competitive Pricing—No Surprises
                </li>
              </ul>
            </div>
            <img
              src="/laundry-difference.jpg"
              alt="Superior Laundry Quality"
              className="rounded-3xl shadow-xl object-cover h-[400px] w-full"
            />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-[#001f3f] mb-8">
              Reclaim Your Time—Let Us Perfect Your Wardrobe
            </h3>
            <button
              onClick={() => (window.location.href = "/book-service")}
              className="bg-gradient-to-r from-[#EA580C] to-[#c94a0a] text-white font-semibold px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Schedule Your First Pickup Today
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
