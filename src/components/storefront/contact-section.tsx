"use client";

import { useState } from "react";
import { Mail, Phone, Smartphone, Send } from "lucide-react";

interface ContactSectionProps {
  storeId: string;
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
  storeId,
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
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          queryType: formData.queryType.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to send message. Please try again.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "", queryType: "" });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setError(message);
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
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-overline mb-3">Contact</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">Get in Touch</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We&apos;d love to hear from you. Reach out through any of our contact channels.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-overline mb-6">Contact Information</h3>

              {/* Email */}
              {contactEmail && (
                <div className="flex gap-3 py-4 border-b border-border group">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-sm text-foreground hover:opacity-70 transition-opacity duration-200 break-all"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {contactPhone && (
                <div className="flex gap-3 py-4 border-b border-border group">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <a
                      href={`tel:${contactPhone}`}
                      className="text-sm text-foreground hover:opacity-70 transition-opacity duration-200"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {whatsappNumber && (
                <div className="flex gap-3 py-4 border-b border-border group">
                  <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:opacity-70 transition-opacity duration-200"
                    >
                      Message us
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            {contactEmail && (
              <div className="lg:col-span-2">
                <div className="border border-border p-6 sm:p-8">
                  <h3 className="text-overline mb-6">Send a Message</h3>

                  {error && (
                    <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 text-xs">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 border border-green-200 bg-green-50 text-green-700 text-xs">
                      Thank you! Your message has been sent successfully.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Email *
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Query Type */}
                    {queryTypes.length > 0 && (
                      <div>
                        <label htmlFor="queryType" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Inquiry Type
                        </label>
                        <select
                          id="queryType"
                          value={formData.queryType}
                          onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
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
                      <label htmlFor="subject" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Message subject"
                        className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Your message..."
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-luxury btn-primary-luxury w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
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
