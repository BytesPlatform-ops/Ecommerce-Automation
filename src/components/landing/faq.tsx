"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "./section-wrapper";
import { Plus, Minus } from "lucide-react";

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
    question: "Is there a free trial?",
    answer:
      "Yes! Every plan comes with a 14-day free trial, no credit card required. You can generate and test your store fully before committing to a plan.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. On the Growth and Pro plans, you can connect your own custom domain with automatic SSL provisioning. On the Starter plan, you get a free subdomain like yourstore.chameleon.dev.",
  },
  {
    question: "How fast are the generated stores?",
    answer:
      "All stores are deployed on a global edge network (CDN) and built with Next.js for optimal performance. Typical Lighthouse scores are 95+ across all metrics, with sub-second load times worldwide.",
  },
  {
    question: "Do you take a percentage of my sales?",
    answer:
      "No. We never take a cut of your revenue. You pay a flat monthly subscription fee and keep 100% of your sales (minus standard Stripe processing fees).",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq" className="py-32">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-purple-600 uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight"
        >
          Frequently asked questions
        </motion.h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 rounded-xl border border-gray-200/60 bg-white/70 px-6 py-4 text-left hover:border-gray-300 transition-all duration-300 group hover:shadow-sm"
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {faq.question}
              </span>
              <span className="shrink-0 text-gray-400">
                {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 text-sm text-gray-500 leading-relaxed">
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
