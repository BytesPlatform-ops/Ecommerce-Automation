"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateStoreDomain } from "@/lib/actions";
import {
  RENDER_CONFIG,
  DOMAIN_STATUS,
  getStatusMessage,
  getStatusColor,
  validateDomainFormat,
  normalizeDomain,
  type DomainStatus,
} from "@/lib/domain-utils";
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";

interface Store {
  id: string;
  domain: string | null;
  domainStatus: DomainStatus;
  certificateGeneratedAt: Date | null;
}

interface DomainSettingsProps {
  store: Store;
}

interface StatusResponse {
  status: DomainStatus;
  domain: string;
  verified: boolean;
  message?: string;
  certificateGeneratedAt?: string;
  error?: string;
}

export function DomainSettings({ store }: DomainSettingsProps) {
  const [domain, setDomain] = useState(store.domain || "");
  const [currentStatus, setCurrentStatus] = useState<DomainStatus>(
    store.domainStatus || DOMAIN_STATUS.PENDING
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    getStatusMessage(store.domainStatus || DOMAIN_STATUS.PENDING)
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const router = useRouter();

  // Check status on mount (once per page load)
  const checkStatus = useCallback(async () => {
    if (!store.domain) return;
    
    setChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/domains/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id }),
      });

      const data: StatusResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to check status");
        return;
      }

      setCurrentStatus(data.status);
      if (data.message) {
        setStatusMessage(data.message);
      }

      // Refresh the page data if status changed to Live
      if (data.status === DOMAIN_STATUS.LIVE) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error checking domain status:", err);
      setError("Failed to check domain status");
    } finally {
      setChecking(false);
    }
  }, [store.id, store.domain, router]);

  // Check status on mount
  useEffect(() => {
    if (store.domain && store.domainStatus !== DOMAIN_STATUS.LIVE) {
      checkStatus();
    }
  }, [store.domain, store.domainStatus, checkStatus]);

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedDomain = normalizeDomain(domain);
    
    // Client-side validation
    if (normalizedDomain) {
      const validation = validateDomainFormat(normalizedDomain);
      if (!validation.valid) {
        setError(validation.error || "Invalid domain format");
        return;
      }
    }

    setSaving(true);

    try {
      const result = await updateStoreDomain(
        store.id,
        normalizedDomain || null
      );

      if (!result.success) {
        setError(result.error || "Failed to save domain");
        return;
      }

      setSuccess(normalizedDomain ? "Domain saved! Add the DNS records below." : "Domain removed.");
      setCurrentStatus(DOMAIN_STATUS.PENDING);
      setStatusMessage(getStatusMessage(DOMAIN_STATUS.PENDING));
      router.refresh();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!confirm("Are you sure you want to remove your custom domain?")) {
      return;
    }

    setDomain("");
    setSaving(true);
    setError(null);

    try {
      const result = await updateStoreDomain(store.id, null);

      if (!result.success) {
        setError(result.error || "Failed to remove domain");
        setDomain(store.domain || "");
        return;
      }

      setSuccess("Domain removed successfully");
      setCurrentStatus(DOMAIN_STATUS.PENDING);
      router.refresh();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove domain");
      setDomain(store.domain || "");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  const statusColors = getStatusColor(currentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>Custom Domain</h3>
          <p className="text-sm text-gray-500">
            Connect your own domain to your store
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Domain Input Form */}
      <form onSubmit={handleSaveDomain} className="space-y-4">
        <div>
          <label
            htmlFor="domain"
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--primary)' }}
          >
            Domain Name
          </label>
          <div className="flex gap-2">
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={saving || (!domain && !store.domain)}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your domain without &quot;http://&quot; or &quot;www.&quot; (e.g., example.com)
          </p>
        </div>
      </form>

      {/* Show DNS Instructions and Status only if domain is set */}
      {store.domain && (
        <>
          {/* Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusColors.bg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${statusColors.dot} ${
                    currentStatus === DOMAIN_STATUS.VERIFYING ||
                    currentStatus === DOMAIN_STATUS.SECURING
                      ? "animate-pulse"
                      : ""
                  }`}
                />
                <span className={`text-sm font-medium ${statusColors.text}`}>
                  {currentStatus}
                </span>
              </div>
              {currentStatus === DOMAIN_STATUS.LIVE && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>

            {/* Refresh Status Button */}
            {currentStatus !== DOMAIN_STATUS.LIVE && (
              <button
                onClick={checkStatus}
                disabled={checking}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-4 h-4 shrink-0 ${checking ? "animate-spin" : ""}`}
                />
                <span>{checking ? "Checking..." : "Refresh"}</span>
              </button>
            )}
          </div>

          {/* Status Message */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {statusMessage}
          </div>

          {/* DNS Records Instructions - Show only if not Live */}
          {currentStatus !== DOMAIN_STATUS.LIVE && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                DNS Records to Add
              </h4>
              <p className="text-sm text-gray-500">
                Add these records at your domain registrar (GoDaddy, Namecheap,
                Cloudflare, etc.)
              </p>

              {/* A Record */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    A Record
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Required
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Host / Name:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-800">
                        @
                      </code>
                      <button
                        onClick={() => copyToClipboard("@", "a-host")}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        {copiedField === "a-host" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Value / Points to:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-800">
                        {RENDER_CONFIG.IP_ADDRESS}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(RENDER_CONFIG.IP_ADDRESS, "a-value")
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        {copiedField === "a-value" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CNAME Record */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    CNAME Record
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    For www subdomain
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Host / Name:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-800">
                        www
                      </code>
                      <button
                        onClick={() => copyToClipboard("www", "cname-host")}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        {copiedField === "cname-host" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Value / Points to:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-800 text-xs break-all">
                        {RENDER_CONFIG.CNAME_TARGET}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(RENDER_CONFIG.CNAME_TARGET, "cname-value")
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        {copiedField === "cname-value" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                💡 Tip: Most registrars use &quot;@&quot; to represent your root domain.
                TTL can be set to &quot;Automatic&quot; or the lowest available value.
              </p>
            </div>
          )}

          {/* Live Domain Link */}
          {currentStatus === DOMAIN_STATUS.LIVE && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Your store is live at:
                </p>
                <a
                  href={`https://${store.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 flex items-center gap-1 mt-1"
                >
                  https://{store.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          )}

          {/* Remove Domain Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleRemoveDomain}
              disabled={saving}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove custom domain
            </button>
          </div>
        </>
      )}
    </div>
  );
}
