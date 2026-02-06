"use client";

import { useState } from "react";
import { Mail, Phone, Smartphone, Send } from "lucide-react";

interface ContactSectionProps {
  storeName: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  supportedQueryTypes?: string;
}

export function ContactSection({
  storeName,
  contactEmail,
  contactPhone,
  whatsappNumber,
  instagramUrl,
  facebookUrl,
  twitterUrl,
  linkedinUrl,
  youtubeUrl,
  supportedQueryTypes,
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    queryType: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const queryTypes = supportedQueryTypes ? JSON.parse(supportedQueryTypes) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // For now, we'll just show a success message
      // In a real app, you'd send this data to an email service like Resend, SendGrid, etc.
      // and store it in a database
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "", queryType: "" });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If no contact info is provided, don't show the section
  if (
    !contactEmail &&
    !contactPhone &&
    !whatsappNumber
  ) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">Get in Touch</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              We'd love to hear from you! Reach out through any of our contact channels.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900" style={{ color: "var(--primary)" }}>Contact Information</h3>

                {/* Email */}
                {contactEmail && (
                  <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80 text-xs sm:text-sm break-all"
                        style={{ color: 'var(--primary)' }}
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {contactPhone && (
                  <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${contactPhone}`}
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80 text-xs sm:text-sm"
                        style={{ color: 'var(--primary)' }}
                      >
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {whatsappNumber && (
                  <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80 text-xs sm:text-sm"
                        style={{ color: 'var(--primary)' }}
                      >
                        Message us
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Contact Form */}
            {contactEmail && (
              <div className="lg:col-span-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900" style={{ color: "var(--primary)" }}>Send us a Message</h3>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm">
                      Thank you! Your message has been sent successfully.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Query Type */}
                    {queryTypes.length > 0 && (
                      <div>
                        <label htmlFor="queryType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="queryType"
                          value={formData.queryType}
                          onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm"
                          style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                        >
                          <option value="">Select inquiry type</option>
                          {queryTypes.map((type: string) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() +
                                type.slice(1).replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Message subject"
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Your message..."
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 text-sm sm:text-base"
                      style={{
                        backgroundColor: "var(--primary)",
                      }}
                    >
                      <Send className="h-4 w-4" />
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
