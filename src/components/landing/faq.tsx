"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "./section-wrapper";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the store generation work?",
    answer:
      "We set up a complete ecommerce store for you in seconds. You get a ready-made dashboard where you can add your products, customize the look and feel, and manage everything yourself. No code needed — just fill in your products and your store is ready to go.",
  },
  {
    question: "Can I customize my store after it's generated?",
    answer:
      "Absolutely. Every generated store comes with a full admin dashboard where you can update products, change themes, modify layouts, add custom domains, and more. For advanced customization, you also get full access to the codebase.",
  },
  {
    question: "What payment providers are supported?",
    answer:
      "We integrate with Stripe out of the box, which supports credit cards, Apple Pay, Google Pay, and dozens of other payment methods. We're also working on adding PayPal, Square, and other providers.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! You can start with our Free plan — no credit card required. You get up to 15 products, a full admin dashboard, and all core features. When you're ready to scale, upgrade to Pro for up to 100 products.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. On the Pro plan, you can connect your own custom domain with automatic SSL provisioning. On the Free plan, you get a free subdomain like yourstore.bytescart.dev.",
  },
  {
    question: "How fast are the generated stores?",
    answer:
      "All stores are deployed on a global edge network (CDN) and built with Next.js for optimal performance. Typical Lighthouse scores are 95+ across all metrics, with sub-second load times worldwide.",
  },
  {
    question: "Do you take a percentage of my sales?",
    answer:
      "No. We never take a cut of your revenue. The Free plan is completely free, and on Pro you pay a flat monthly or yearly fee. You keep 100% of your sales (minus standard Stripe processing fees).",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq" className="py-20 bg-[#0D2B1F]">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A3D2B] border border-[#D4873A]/30 mb-6"
        >
          <HelpCircle className="w-4 h-4 text-[#D4873A]" />
          <span className="text-lg font-semibold text-[#D4873A]">FAQ</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F0E8] tracking-tight mb-4"
        >
          Your questions,{" "}
          <span className="bg-gradient-to-r from-[#D4873A] to-[#C9A84C] bg-clip-text text-transparent">
            answered
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#8FA898] max-w-lg mx-auto text-lg"
        >
          Everything you need to know about BytesCart and our platform
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className="group"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className={`w-full flex items-start justify-between gap-4 rounded-2xl border-2 px-6 py-5 text-left transition-all duration-300 ${
                openIndex === i
                  ? "border-[#D4873A]/50 bg-[#F5F0E8] shadow-lg shadow-[#D4873A]/10"
                  : "border-[#F5F0E8]/20 bg-[#F5F0E8] hover:border-[#D4873A]/30 hover:shadow-md hover:shadow-[#D4873A]/10"
              }`}
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-semibold text-[#1A3D2B] group-hover:text-[#D4873A] transition-colors leading-relaxed flex-1 pt-0.5">
                {faq.question}
              </span>
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                openIndex === i
                  ? "bg-gradient-to-br from-[#D4873A] to-[#C9A84C] text-white"
                  : "bg-[#1A3D2B]/10 text-[#8FA898] group-hover:bg-[#D4873A]/20 group-hover:text-[#D4873A]"
              }`}>
                {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-5 rounded-2xl bg-[#F5F0E8]/80 border border-[#1A3D2B]/10 text-sm text-[#1A3D2B]/80 leading-relaxed font-light">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
