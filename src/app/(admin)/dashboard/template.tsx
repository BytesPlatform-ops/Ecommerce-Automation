"use client";

import { usePathname } from "next/navigation";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Key forces React to unmount/remount children on route change,
  // preventing stale page content (e.g. themes) from persisting
  // when navigating between dashboard sub-pages.
  return <div key={pathname}>{children}</div>;
}
