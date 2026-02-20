"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Mail, Phone, MapPin, Send, ArrowRight, Sparkles } from "lucide-react";

const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-3xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
    </div>
  ),
});

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      const res = await fetch("/api/landing-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-violet-50/30" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-blue-200/30 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -60, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-[30%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-300/20 to-pink-200/20 blur-3xl"
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-violet-500/5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              We&apos;d love to hear from you
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6"
          >
            <span className="text-gray-900">Get in </span>
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Touch
              </span>
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
              >
                <motion.path
                  d="M2 8C50 2 150 2 198 8"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Have a question or want to work together? We&apos;re here to help you build something amazing.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Contact Form - Glass Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <div className="relative p-8 sm:p-10 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-violet-500/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-blue-500/5 rounded-tr-3xl rounded-bl-[100px]" />
                
                <div className="relative">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Send us a message
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </p>

                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200/60 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Failed to send</p>
                        <p className="text-sm text-red-600">{formError}</p>
                      </div>
                    </motion.div>
                  )}

                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800">Message sent successfully!</p>
                        <p className="text-sm text-emerald-600">We&apos;ll be in touch shortly.</p>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div className="relative">
                        <motion.label
                          animate={{
                            y: focused === "name" || formData.name ? -24 : 0,
                            scale: focused === "name" || formData.name ? 0.85 : 1,
                            color: focused === "name" ? "#7c3aed" : "#6b7280",
                          }}
                          className="absolute left-4 top-4 text-gray-500 pointer-events-none origin-left transition-all"
                        >
                          Full Name
                        </motion.label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                          required
                          className="w-full px-4 pt-6 pb-3 rounded-xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="relative">
                        <motion.label
                          animate={{
                            y: focused === "email" || formData.email ? -24 : 0,
                            scale: focused === "email" || formData.email ? 0.85 : 1,
                            color: focused === "email" ? "#7c3aed" : "#6b7280",
                          }}
                          className="absolute left-4 top-4 text-gray-500 pointer-events-none origin-left transition-all"
                        >
                          Email Address
                        </motion.label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          required
                          className="w-full px-4 pt-6 pb-3 rounded-xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div className="relative">
                      <motion.label
                        animate={{
                          y: focused === "subject" || formData.subject ? -24 : 0,
                          scale: focused === "subject" || formData.subject ? 0.85 : 1,
                          color: focused === "subject" ? "#7c3aed" : "#6b7280",
                        }}
                        className="absolute left-4 top-4 text-gray-500 pointer-events-none origin-left transition-all"
                      >
                        Subject
                      </motion.label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onFocus={() => setFocused("subject")}
                        onBlur={() => setFocused(null)}
                        required
                        className="w-full px-4 pt-6 pb-3 rounded-xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Message Field */}
                    <div className="relative">
                      <motion.label
                        animate={{
                          y: focused === "message" || formData.message ? -24 : 0,
                          scale: focused === "message" || formData.message ? 0.85 : 1,
                          color: focused === "message" ? "#7c3aed" : "#6b7280",
                        }}
                        className="absolute left-4 top-4 text-gray-500 pointer-events-none origin-left transition-all"
                      >
                        Your Message
                      </motion.label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        required
                        rows={5}
                        className="w-full px-4 pt-6 pb-3 rounded-xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={sending ? {} : { scale: 1.02 }}
                      whileTap={sending ? {} : { scale: 0.98 }}
                      className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-lg shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          Send Message
                          <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Cards */}
              {[
                {
                  icon: Mail,
                  label: "Email Us",
                  value: "bytesuite@bytesplatform.com",
                  subtext: "We reply within 24 hours",
                  gradient: "from-violet-500 to-violet-600",
                },
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "+1 (555) 123-4567",
                  subtext: "Mon-Fri, 9am-6pm EST",
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  icon: MapPin,
                  label: "Visit Us",
                  value: "Denton, TX",
                  subtext: "By appointment only",
                  gradient: "from-emerald-500 to-teal-600",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                        {item.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{item.subtext}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Office Hours Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-xl shadow-violet-500/25"
              >
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  We&apos;re Online
                </h4>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-white font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-white font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-white/60">Closed</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-white/80"
            style={{ isolation: "isolate" }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-white/60">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-gray-700">Bytescart HQ &mdash; Denton, Texas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-500">Live</span>
              </div>
            </div>
            <MapComponent />
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      {/*  */}
    </div>
  );
}
