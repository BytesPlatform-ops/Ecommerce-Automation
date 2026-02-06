"use client";

import { useState } from "react";
import { Store } from "@/types/database";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { DomainSettings } from "@/components/dashboard/domain-settings";
import { ContactSettings } from "@/components/dashboard/contact-settings";
import { Store as StoreIcon, Globe, Phone } from "lucide-react";

interface SettingsPageContentProps {
  store: Store;
  domainStore: {
    id: string;
    domain: string | null;
    domainStatus: string;
    certificateGeneratedAt: Date | null;
  };
}

const tabs = [
  {
    id: "store",
    label: "Store Details",
    icon: StoreIcon,
    description: "Manage your store name, description, and hero image",
  },
  {
    id: "domain",
    label: "Custom Domain",
    icon: Globe,
    description: "Set up your custom domain",
  },
  {
    id: "contact",
    label: "Contact Information",
    icon: Phone,
    description: "Add contact details and social media links",
  },
];

export function SettingsPageContent({ store, domainStore }: SettingsPageContentProps) {
  const [activeTab, setActiveTab] = useState("store");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store details, custom domain, and contact information</p>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* Tab Header */}
        <div className="mb-6">
          {tabs.map((tab) => {
            if (tab.id === activeTab) {
              const Icon = tab.icon;
              return (
                <div key={tab.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{tab.label}</h2>
                      <p className="text-sm text-gray-600 mt-1">{tab.description}</p>
                    </div>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-4" />
                </div>
              );
            }
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "store" && <SettingsForm store={store} />}
          {activeTab === "domain" && <DomainSettings store={domainStore} />}
          {activeTab === "contact" && <ContactSettings store={store} />}
        </div>
      </div>
    </div>
  );
}
