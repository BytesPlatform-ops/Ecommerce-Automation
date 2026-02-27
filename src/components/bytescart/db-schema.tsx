"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const tables = [
  {
    name: "products",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "name", type: "varchar(255)", pk: false },
      { name: "price", type: "decimal(10,2)", pk: false },
      { name: "stock", type: "integer", pk: false },
      { name: "store_id", type: "uuid FK", pk: false },
    ],
  },
  {
    name: "orders",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "total", type: "decimal(10,2)", pk: false },
      { name: "status", type: "enum", pk: false },
      { name: "customer_id", type: "uuid FK", pk: false },
    ],
  },
  {
    name: "customers",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "email", type: "varchar(255)", pk: false },
      { name: "name", type: "varchar(255)", pk: false },
      { name: "created_at", type: "timestamp", pk: false },
    ],
  },
  {
    name: "variants",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "product_id", type: "uuid FK", pk: false },
      { name: "sku", type: "varchar(100)", pk: false },
      { name: "price", type: "decimal(10,2)", pk: false },
    ],
  },
];

function SchemaTable({
  table,
  delay,
}: {
  table: (typeof tables)[0];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
    >
      {/* Table name */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00FF88]/60" />
        <span className="text-white/90 text-sm font-mono font-semibold">{table.name}</span>
      </div>
      {/* Columns */}
      <div className="divide-y divide-white/[0.03]">
        {table.columns.map((col) => (
          <div key={col.name} className="px-4 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {col.pk && (
                <span className="text-[9px] font-bold text-[#0B0F14] bg-[#00FF88] px-1.5 py-0.5 rounded tracking-wider">
                  PK
                </span>
              )}
              <span
                className={`text-xs font-mono ${
                  col.pk
                    ? "text-[#00FF88] drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]"
                    : "text-white/60"
                }`}
              >
                {col.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/25">{col.type}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ConnectionLines() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setDrawn(true), 600);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <svg
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block"
      style={{ overflow: "visible" }}
    >
      {/* products → variants */}
      <line
        x1="25%" y1="25%" x2="75%" y2="75%"
        stroke="#00FF88"
        strokeWidth="1"
        strokeOpacity="0.15"
        strokeDasharray="400"
        strokeDashoffset={drawn ? 0 : 400}
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      {/* orders → customers */}
      <line
        x1="75%" y1="25%" x2="25%" y2="75%"
        stroke="#00FF88"
        strokeWidth="1"
        strokeOpacity="0.15"
        strokeDasharray="400"
        strokeDashoffset={drawn ? 0 : 400}
        style={{ transition: "stroke-dashoffset 1.5s ease-out 0.3s" }}
      />
      {/* products → orders (horizontal) */}
      <line
        x1="30%" y1="20%" x2="70%" y2="20%"
        stroke="#00FF88"
        strokeWidth="1"
        strokeOpacity="0.1"
        strokeDasharray="300"
        strokeDashoffset={drawn ? 0 : 300}
        style={{ transition: "stroke-dashoffset 1.2s ease-out 0.6s" }}
      />
    </svg>
  );
}

export function DbSchema() {
  return (
    <section className="relative py-20 sm:py-32 px-5">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[#00FF88] text-xs font-semibold tracking-wider uppercase mb-4 block">
            Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Production-grade <span className="text-[#00FF88]">PostgreSQL</span>
          </h2>
          <p className="text-current opacity-50 max-w-xl mx-auto text-base sm:text-lg font-light">
            Enterprise database schema auto-generated for every store.
          </p>
        </motion.div>

        {/* Schema grid */}
        <div className="relative">
          <ConnectionLines />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
            {tables.map((table, i) => (
              <SchemaTable key={table.name} table={table} delay={i * 0.12} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
