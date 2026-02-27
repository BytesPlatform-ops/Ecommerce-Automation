"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface MobileSidebarToggleProps {
  children: React.ReactNode;
}

export function MobileSidebarToggle({ children }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Check if we're on mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    // Initial check
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Hamburger button - visible only on mobile when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] h-11 w-11 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Overlay - click to close (only on mobile) */}
      {isMobile && (
        <div
          className={`
            fixed inset-0 bg-black/50 z-40 backdrop-blur-sm
            transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'static'} inset-y-0 left-0 z-50
          w-72 bg-white border-r border-gray-200/80 flex flex-col shadow-xl shadow-gray-200/50 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? (isOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none")
            : "translate-x-0 opacity-100"
          } 
        `}
      >
        {/* Close button inside sidebar - top right */}
        {isMobile && (
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute top-4 right-4 z-10 h-9 w-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Sidebar content */}
        <div className="flex flex-col h-full" onClick={isMobile ? closeSidebar : undefined}>
          {children}
        </div>
      </aside>
    </>
  );
}
