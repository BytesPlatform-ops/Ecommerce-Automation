"use client";

import { useState } from "react";
import { Store, StoreFaq, StorePrivacySection, StoreShippingReturnsSection, StoreTestimonial, StoreShippingLocation } from "@/types/database";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { DomainSettings } from "@/components/dashboard/domain-settings";
import { ContactSettings } from "@/components/dashboard/contact-settings";
import { FaqSettings } from "@/components/dashboard/faq-settings";
import { PrivacyPolicySettings } from "@/components/dashboard/privacy-policy-settings";
import { ShippingReturnsSettings } from "@/components/dashboard/shipping-returns-settings";
import { TestimonialsSettings } from "@/components/dashboard/testimonials-settings";
import { ShippingLocationsSettings } from "@/components/dashboard/shipping-locations-settings";
import { Store as StoreIcon, Globe, Phone, HelpCircle, Shield, MessageCircle, Truck, MapPin } from "lucide-react";
import type { DomainStatus } from "@/lib/domain-utils";

interface SettingsPageContentProps {
  store: Store;
  faqs: StoreFaq[];
  privacySections: StorePrivacySection[];
  shippingReturnsSections: StoreShippingReturnsSection[];
  testimonials: StoreTestimonial[];
  shippingLocations: StoreShippingLocation[];
  domainStore: {
    id: string;
    domain: string | null;
    domainStatus: DomainStatus;
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
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    description: "Manage frequently asked questions for your store",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: MessageCircle,
    description: "Manage customer testimonials displayed on your storefront",
  },
  {
    id: "shipping",
    label: "Shipping & Returns",
    icon: Truck,
    description: "Manage shipping and return policies for your store",
  },
  {
    id: "locations",
    label: "Shipping Locations",
    icon: MapPin,
    description: "Define countries and cities where your products can be shipped",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: Shield,
    description: "Create the privacy policy shown on your storefront",
  },
];

export function SettingsPageContent({
  store,
  domainStore,
  faqs,
  privacySections,
  shippingReturnsSections,
  testimonials,
  shippingLocations,
}: SettingsPageContentProps) {
  const [activeTab, setActiveTab] = useState("store");

  return (
    <div>
      <div className="mb-8 dash-animate-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">Store Settings</h1>
        <p className="text-gray-500 mt-1">Manage your store details, custom domain, and contact information</p>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="mb-6 dash-animate-in dash-delay-1">
        <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`dash-tab flex items-center gap-2 ${isActive ? 'active bg-white shadow-sm' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dash-animate-in dash-delay-2">
        {/* Tab Header */}
        <div className="mb-6">
          {tabs.map((tab) => {
            if (tab.id === activeTab) {
              const Icon = tab.icon;
              return (
                <div key={tab.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{tab.label}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{tab.description}</p>
                    </div>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent mt-4 rounded-full" />
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
          {activeTab === "faq" && <FaqSettings storeId={store.id} faqs={faqs} />}
          {activeTab === "testimonials" && (
            <TestimonialsSettings storeId={store.id} testimonials={testimonials} />
          )}
          {activeTab === "shipping" && (
            <ShippingReturnsSettings storeId={store.id} sections={shippingReturnsSections} />
          )}
          {activeTab === "locations" && (
            <ShippingLocationsSettings storeId={store.id} locations={shippingLocations} />
          )}
          {activeTab === "privacy" && (
            <PrivacyPolicySettings storeId={store.id} sections={privacySections} />
          )}
        </div>
      </div>
    </div>
  );
}
