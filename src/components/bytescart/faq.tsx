"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    question: "How does the store setup work?",
    answer:
      "We create a complete ecommerce store for you in seconds. You get a ready-made dashboard where you can add your products, customize the look and feel, and manage everything yourself. No code needed — just fill in your products and your store is ready to go.",
  },
  {
    question: "Can I customize my store after it's created?",
    answer:
      "Absolutely. Every store comes with a full admin dashboard where you can update products, change themes, modify layouts, add custom domains, and more. For advanced customization, you also get full access to the codebase.",
  },
  {
    question: "What payment providers are supported?",
    answer:
      "We integrate with Stripe out of the box, which supports credit cards, Apple Pay, Google Pay, and dozens of other payment methods. We're also working on adding PayPal, Square, and other providers.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! You can start with our Starter plan — no credit card required. You get 1 store, up to 50 products, a full admin dashboard, and all core features. When you're ready to scale, upgrade to Pro for unlimited products and more stores.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. On the Pro plan, you can connect your own custom domain with automatic SSL provisioning. On the Starter plan, you get a free subdomain like yourstore.bytescart.dev.",
  },
  {
    question: "How fast are the stores?",
    answer:
      "All stores are deployed on a global edge network (CDN) and built with Next.js for optimal performance. Typical Lighthouse scores are 95+ across all metrics, with sub-second load times worldwide.",
  },
  {
    question: "Do you take a percentage of my sales?",
    answer:
      "No. We never take a cut of your revenue. The Starter plan is completely free, and on Pro you pay a flat monthly or yearly fee. You keep 100% of your sales (minus standard Stripe processing fees).",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 sm:py-32 px-5" id="faq">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="text-[#10B981] text-xs font-semibold tracking-wider uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Got <span className="text-[#10B981]">questions?</span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Everything you need to know about Bytescart
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`
                  w-full flex items-center justify-between gap-4 
                  rounded-2xl border px-6 py-5 text-left 
                  transition-all duration-300 group
                  ${openIndex === i
                    ? "border-[#10B981]/40 bg-[#10B981]/[0.03] shadow-lg shadow-[#10B981]/5"
                    : "border-current/[0.08] bg-current/[0.02] hover:border-[#10B981]/20 hover:bg-[#10B981]/[0.02]"
                  }
                `}
                aria-expanded={openIndex === i}
              >
                <span className="text-sm sm:text-base font-semibold text-current group-hover:text-[#10B981] transition-colors leading-relaxed flex-1">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                    text-xl font-light transition-all duration-300
                    ${openIndex === i
                      ? "bg-[#10B981] text-[#0B0F14]"
                      : "bg-current/[0.08] text-current/60 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981]"
                    }
                  `}
                >
                  +
                </motion.span>
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
                    <motion.div
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 py-5 mt-2 rounded-2xl bg-current/[0.02] border border-current/[0.05]"
                    >
                      <p className="text-sm sm:text-base text-current/70 leading-relaxed font-light">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <p className="text-current/40 text-sm mb-6">
            Still have questions?
          </p>
          <motion.a
            href="bytesuite@bytesplatform.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#10B981] text-[#0B0F14] text-sm font-bold shadow-[0_0_24px_rgba(0,255,136,0.25)] hover:shadow-[0_0_40px_rgba(0,255,136,0.45)] transition-shadow duration-300 group overflow-hidden"
          >
            {/* shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="relative z-10">Get in touch</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
