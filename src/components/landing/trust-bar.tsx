"use client";

import { motion } from "framer-motion";

const logos = [
  "Acme Inc",
  "NovaTech",
  "Flux Studio",
  "Vertex",
  "Orbit",
  "Prism Co",
];

export function TrustBar() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-gray-400 uppercase tracking-[0.2em] mb-10 font-medium"
        >
          Trusted by forward-thinking teams
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2.5 text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-default"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold bg-gradient-to-br from-violet-600 to-blue-600 bg-clip-text text-transparent">{name[0]}</span>
              </div>
              <span className="text-sm font-medium tracking-tight">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* Divider */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  );
}
