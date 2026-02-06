"use client";

import { useState } from "react";
import { Mail, Phone, Smartphone, Instagram, Facebook, Twitter, Linkedin, Youtube, Send } from "lucide-react";

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
    !whatsappNumber &&
    !instagramUrl &&
    !facebookUrl &&
    !twitterUrl &&
    !linkedinUrl &&
    !youtubeUrl
  ) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              We'd love to hear from you! Reach out through any of our contact channels.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-900" style={{ color: "var(--primary)" }}>Contact Information</h3>

                {/* Email */}
                {contactEmail && (
                  <div className="flex gap-4 mb-6 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {contactPhone && (
                  <div className="flex gap-4 mb-6 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${contactPhone}`}
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                      >
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {whatsappNumber && (
                  <div className="flex gap-4 mb-6 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-gray-200">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium transition-colors truncate block hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                      >
                        Message us
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(instagramUrl || facebookUrl || twitterUrl || linkedinUrl || youtubeUrl) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900" style={{ color: "var(--primary)" }}>Follow Us</h3>
                  <div className="space-y-3">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                      >
                        <Instagram className="h-5 w-5 text-pink-500 group-hover:text-pink-600" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Instagram</span>
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                      >
                        <Facebook className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Facebook</span>
                      </a>
                    )}
                    {twitterUrl && (
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                      >
                        <Twitter className="h-5 w-5 text-sky-500 group-hover:text-sky-600" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Twitter</span>
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                      >
                        <Linkedin className="h-5 w-5 text-blue-700 group-hover:text-blue-800" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">LinkedIn</span>
                      </a>
                    )}
                    {youtubeUrl && (
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                      >
                        <Youtube className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            {contactEmail && (
              <div className="lg:col-span-2">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900" style={{ color: "var(--primary)" }}>Send us a Message</h3>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                      Thank you! Your message has been sent successfully.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Query Type */}
                    {queryTypes.length > 0 && (
                      <div>
                        <label htmlFor="queryType" className="block text-sm font-medium text-gray-700 mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="queryType"
                          value={formData.queryType}
                          onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50"
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
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Message subject"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-opacity-50"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Your message..."
                        rows={5}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none focus:ring-2 focus:ring-opacity-50"
                        style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                      style={{
                        backgroundColor: "var(--primary)",
                      }}
                    >
                      <Send className="h-5 w-5" />
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
