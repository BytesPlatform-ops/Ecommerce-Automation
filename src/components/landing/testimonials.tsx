"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SectionWrapper } from "./section-wrapper";
import { Star, ChevronLeft, ChevronRight, Quote, TrendingUp } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, Bloom Skincare",
    avatar: "SC",
    rating: 5,
    text: "I described my skincare brand and had a fully functional store with payments live in under 2 minutes. The speed is unreal.",
    result: "Generated $42K in first month",
    accentColor: "from-violet-500 to-purple-500",
  },
  {
    name: "Marcus Johnson",
    role: "CEO, StreetVault",
    avatar: "MJ",
    rating: 5,
    text: "We used to spend $15k+ on agency builds. Now we spin up client stores in seconds. Bytescart changed our entire business model.",
    result: "Saved $180K in agency costs",
    accentColor: "from-blue-500 to-cyan-500",
  },
  {
    name: "Lea Moreau",
    role: "Dropshipper",
    avatar: "LM",
    rating: 5,
    text: "I've launched 12 stores this month. Each one looks custom-built. The AI understands branding better than most designers I've worked with.",
    result: "12 stores, $8K MRR combined",
    accentColor: "from-emerald-500 to-teal-500",
  },
  {
    name: "David Kim",
    role: "Agency Owner, Pixel Labs",
    avatar: "DK",
    rating: 5,
    text: "The admin dashboard alone saves us 40 hours per project. Combined with auto-deployment, it's a no-brainer for our team.",
    result: "40+ hours saved per project",
    accentColor: "from-orange-500 to-amber-500",
  },
  {
    name: "Aisha Patel",
    role: "Creator & Influencer",
    avatar: "AP",
    rating: 5,
    text: "I'm not technical at all and I built my merch store in a minute. My audience was buying within the hour. Insane.",
    result: "First sale in under 1 hour",
    accentColor: "from-pink-500 to-rose-500",
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
    <SectionWrapper className="py-16 sm:py-24">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-violet-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Success Stories
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5"
        >
          Trusted by{" "}
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            12,000+ founders
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-lg"
        >
          Real results from real businesses. See why founders choose Bytescart.
        </motion.p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Carousel */}
        <div className="relative h-[340px] sm:h-[300px] overflow-hidden">
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
              <div className="h-full rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl p-8 sm:p-10 flex flex-col justify-between shadow-xl shadow-violet-100/30">
                {/* Quote icon and stars */}
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-violet-200" />
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* ROI Result Badge */}
                <div className="mt-4 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">{testimonial.result}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.accentColor} flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
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
            className="w-12 h-12 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-300"
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-gradient-to-r from-violet-500 to-blue-500 w-8" : "bg-gray-300 hover:bg-gray-400 w-2"
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
