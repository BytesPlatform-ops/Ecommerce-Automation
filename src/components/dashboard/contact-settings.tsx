"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions";
import { Store } from "@/types/database";
import { Mail, Phone, Instagram, Facebook, Twitter, Linkedin, Youtube, MessageSquare, CheckCircle } from "lucide-react";

interface ContactSettingsProps {
  store: Store;
}

const QUERY_TYPES = [
  { id: "feedback", label: "Feedback", icon: "💬" },
  { id: "complaint", label: "Complaint", icon: "⚠️" },
  { id: "inquiry", label: "General Inquiry", icon: "❓" },
  { id: "support", label: "Support Request", icon: "🆘" },
  { id: "collaboration", label: "Collaboration", icon: "🤝" },
  { id: "partnership", label: "Partnership", icon: "💼" },
];

export function ContactSettings({ store }: ContactSettingsProps) {
  const [contactEmail, setContactEmail] = useState((store as any).contactEmail || "");
  const [contactPhone, setContactPhone] = useState((store as any).contactPhone || "");
  const [instagramUrl, setInstagramUrl] = useState((store as any).instagramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState((store as any).facebookUrl || "");
  const [twitterUrl, setTwitterUrl] = useState((store as any).twitterUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState((store as any).linkedinUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState((store as any).youtubeUrl || "");
  const [whatsappNumber, setWhatsappNumber] = useState((store as any).whatsappNumber || "");
  
  const [selectedQueryTypes, setSelectedQueryTypes] = useState<string[]>(() => {
    const stored = (store as any).supportedQueryTypes;
    return stored ? JSON.parse(stored) : [];
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleQueryType = (typeId: string) => {
    setSelectedQueryTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!contactEmail.trim() && !contactPhone.trim() && Object.keys(selectedQueryTypes).length === 0) {
      setError("Please add at least one contact method or query type");
      return;
    }

    if (contactEmail.trim() && !contactEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await updateStore(store.id, {
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        supportedQueryTypes: selectedQueryTypes.length > 0 ? JSON.stringify(selectedQueryTypes) : null,
      });

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Contact settings saved successfully!
        </div>
      )}

      {/* Contact Information Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Direct Contact Methods
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Add contact information where customers can reach you directly
        </p>

        {/* Contact Email */}
        <div className="mb-4">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@yourstore.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            This email will receive customer inquiries and feedback
          </p>
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* WhatsApp Section */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp
        </h3>
        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number
        </label>
        <input
          id="whatsappNumber"
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Customers can contact you via WhatsApp
        </p>
      </div>

      {/* Social Media Section */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3">Social Media Links</h3>
        <p className="text-sm text-purple-700 mb-4">
          Add your social media profiles so customers can follow and connect with you
        </p>

        <div className="space-y-4">
          {/* Instagram */}
          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </label>
            <input
              id="instagramUrl"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Facebook */}
          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </label>
            <input
              id="facebookUrl"
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Twitter */}
          <div>
            <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              Twitter / X
            </label>
            <input
              id="twitterUrl"
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/yourprofile"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
            />
          </div>

          {/* YouTube */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-600" />
              YouTube
            </label>
            <input
              id="youtubeUrl"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Query Types Section */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-3">What inquiries do you accept?</h3>
        <p className="text-sm text-amber-700 mb-4">
          Select the types of inquiries customers can send through the contact section
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUERY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleQueryType(type.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left font-medium flex items-center gap-2 ${
                selectedQueryTypes.includes(type.id)
                  ? "border-amber-500 bg-amber-100 text-amber-900"
                  : "border-amber-200 bg-white text-gray-700 hover:border-amber-300"
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Saving..." : "Save Contact Settings"}
      </button>
    </form>
  );
}
