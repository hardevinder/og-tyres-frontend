"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  review: string;
  rating: number;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: "Emily Parker",
      role: "Freelance Designer",
      review:
        "This service has been a game-changer for my hectic workflow. The app is intuitive, pickups are prompt, and my delicates come back pristine every time. Couldn't ask for more!",
      rating: 5,
    },
    {
      name: "James Anderson",
      role: "Tech Entrepreneur",
      review:
        "Efficiency at its finest. From scheduling to spotless results, everything exceeds expectations. Affordable pricing makes it a no-brainer for busy founders like me.",
      rating: 5,
    },
    {
      name: "Sarah Mitchell",
      role: "Homemaker",
      review:
        "Gentle on fabrics and kind to the planet—love the sustainable approach. My family's laundry routine is now effortless and eco-conscious.",
      rating: 5,
    },
    {
      name: "Daniel Thompson",
      role: "Fitness Coach",
      review:
        "Quick, reliable, and thorough. My gym gear looks brand new after every wash. The team's attention to detail keeps me coming back week after week.",
      rating: 4,
    },
    {
      name: "Olivia Bennett",
      role: "Teacher",
      review:
        "Exceptional quality and friendly service. Stains that once seemed impossible are history. It's like having a personal laundry expert at my doorstep.",
      rating: 5,
    },
    {
      name: "Michael Harris",
      role: "Sales Executive",
      review:
        "Seamless integration into my travel-heavy lifestyle. Professional handling of suits and shirts—wrinkle-free and ready to wear. Top-notch reliability!",
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slidesToShow = 2;
  const slideCount = Math.ceil(testimonials.length / slidesToShow);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(nextSlide, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, nextSlide]);

  const handleDotClick = (index: number) => setCurrentIndex(index);
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const renderStars = (rating: number) => (
    <div className="flex justify-center mb-4" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-colors duration-200 ${
            i < rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const renderTestimonial = (testimonial: Testimonial, index: number) => (
    <article
      key={index}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10 text-center hover:shadow-lg transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
      role="article"
      tabIndex={0}
    >
      {renderStars(testimonial.rating)}
      <blockquote className="text-gray-700 text-base md:text-lg italic mb-5 leading-relaxed">
        "{testimonial.review}"
      </blockquote>
      <div>
        <h4 className="text-lg font-bold text-[#1E1B17]">{testimonial.name}</h4>
        <p className="text-sm text-gray-500">{testimonial.role}</p>
      </div>
    </article>
  );

  return (
    <section
      className="relative w-full bg-[#fafafa] py-24 px-6 md:px-12 overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative background elements */}
      <div className="absolute -top-20 left-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/15 rounded-full blur-3xl opacity-40" />

      {/* Heading */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2
          id="testimonials-heading"
          className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1E1B17] tracking-tight"
        >
          What Our Customers Say
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Real stories from people who trust our laundry service for quality,
          convenience, and care.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-label="Testimonials carousel"
      >
        <div
          className="flex transition-transform duration-[2000ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transform: `translateX(-${currentIndex * (100 / slideCount)}%)`,
            width: `${slideCount * 100}%`,
          }}
          aria-live="polite"
        >
          {[...Array(slideCount)].map((_, slideIndex) => {
            const start = slideIndex * slidesToShow;
            const items = testimonials.slice(start, start + slidesToShow);
            return (
              <div
                key={slideIndex}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-shrink-0 w-full px-4"
                style={{ width: `${100 / slideCount}%` }}
              >
                {items.map((t, i) => renderTestimonial(t, start + i))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Navigation */}
      <nav className="flex justify-center gap-2 mt-10" aria-label="Carousel navigation">
        {[...Array(slideCount)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 ${
              currentIndex === i ? "bg-[#F59E0B]" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={currentIndex === i ? "true" : undefined}
          />
        ))}
      </nav>
    </section>
  );
}
