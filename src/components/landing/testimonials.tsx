"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SectionWrapper } from "./section-wrapper";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, Bloom Skincare",
    avatar: "SC",
    rating: 5,
    text: "I described my skincare brand and had a fully functional store with payments live in under 2 minutes. The speed is unreal.",
    accentColor: "from-purple-500 to-pink-500",
  },
  {
    name: "Marcus Johnson",
    role: "CEO, StreetVault",
    avatar: "MJ",
    rating: 5,
    text: "We used to spend $15k+ on agency builds. Now we spin up client stores in seconds. Chameleon changed our entire business model.",
    accentColor: "from-blue-500 to-cyan-500",
  },
  {
    name: "Lea Moreau",
    role: "Dropshipper",
    avatar: "LM",
    rating: 5,
    text: "I've launched 12 stores this month. Each one looks custom-built. The AI understands branding better than most designers I've worked with.",
    accentColor: "from-emerald-500 to-teal-500",
  },
  {
    name: "David Kim",
    role: "Agency Owner, Pixel Labs",
    avatar: "DK",
    rating: 5,
    text: "The admin dashboard alone saves us 40 hours per project. Combined with auto-deployment, it's a no-brainer for our team.",
    accentColor: "from-orange-500 to-red-500",
  },
  {
    name: "Aisha Patel",
    role: "Creator & Influencer",
    avatar: "AP",
    rating: 5,
    text: "I'm not technical at all and I built my merch store in a minute. My audience was buying within the hour. Insane.",
    accentColor: "from-violet-500 to-purple-500",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const getVisibleTestimonials = () => {
    const items = [];
    for (let i = -1; i <= 1; i++) {
      const index = (current + i + testimonials.length) % testimonials.length;
      items.push({ ...testimonials[index], position: i });
    }
    return items;
  };

  return (
    <SectionWrapper className="py-32">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-purple-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight"
        >
          Loved by builders
        </motion.h2>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Carousel */}
        <div className="relative h-[280px] sm:h-[240px] overflow-hidden">
          {getVisibleTestimonials().map((testimonial) => (
            <motion.div
              key={`${testimonial.name}-${testimonial.position}`}
              initial={{
                x: direction >= 0 ? "100%" : "-100%",
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                x: testimonial.position === 0 ? "0%" : testimonial.position > 0 ? "110%" : "-110%",
                opacity: testimonial.position === 0 ? 1 : 0,
                scale: testimonial.position === 0 ? 1 : 0.8,
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <div className="h-full rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-8 sm:p-10 flex flex-col justify-between shadow-lg shadow-gray-100/50">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-600 text-base leading-relaxed flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.accentColor} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-purple-500 w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
