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
    question: "Is there a free trial?",
    answer:
      "Yes! Every plan comes with a 14-day free trial, no credit card required. You can generate and test your store fully before committing to a plan.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. On the Growth and Pro plans, you can connect your own custom domain with automatic SSL provisioning. On the Starter plan, you get a free subdomain like yourstore.bytescart.dev.",
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200/60 mb-6"
        >
          <HelpCircle className="w-4 h-4 text-violet-600" />
          <span className="text-lg font-semibold text-violet-700">FAQ</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4"
        >
          Your questions,{" "}
          <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            answered
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-lg mx-auto text-lg"
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
                  ? "border-violet-400 bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50 shadow-lg shadow-violet-200/30"
                  : "border-gray-200/80 bg-white/60 hover:border-violet-300 hover:bg-gradient-to-br hover:from-violet-50/40 hover:to-blue-50/40 hover:shadow-md hover:shadow-violet-100/20"
              }`}
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-semibold text-gray-800 group-hover:text-violet-700 transition-colors leading-relaxed flex-1 pt-0.5">
                {faq.question}
              </span>
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                openIndex === i
                  ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-600"
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
                  <div className="px-6 py-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-50/50 border border-gray-200/60 text-sm text-gray-600 leading-relaxed font-light">
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
