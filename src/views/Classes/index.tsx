"use client";

import Link from "next/link";
import { ArrowRight, Building2, LayoutDashboard, Settings } from "lucide-react";
import ClassSchedule from "@/views/Classes/ClassSchedule";
import Footer from "@/views/Classes/Footer";
import { useAuthContext } from "@/providers/AuthProvider";
import { useOrganizationContext } from "@/providers/OrganizationProvider";
import { ROUTES } from "@/lib/routes";

function StudioCTA() {
  return (
    <div className="border-b border-zinc-900 bg-zinc-950">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Building2 className="w-4 h-4 text-zinc-600 shrink-0" />
          <p className="text-sm text-zinc-400 font-display truncate">
            Own a studio? List your classes and get paid instantly in crypto.
          </p>
        </div>
        <Link
          href={ROUTES.CREATE_ORGANIZATION}
          className="flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-white hover:text-zinc-300 transition-colors shrink-0"
        >
          Get Started <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function StudioAdminBar({ name }: { name: string }) {
  return (
    <div className="border-b border-zinc-900 bg-zinc-950">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Building2 className="w-4 h-4 text-zinc-600 shrink-0" />
          <p className="text-sm text-zinc-400 font-display truncate">
            Studio: <span className="text-white font-mono">{name}</span>
          </p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <Link
            href={ROUTES.ORGANIZATION_CLASSES}
            className="flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-3 h-3" />
            Classes
          </Link>
          <Link
            href={ROUTES.ORGANIZATION_SETTINGS}
            className="flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
          >
            <Settings className="w-3 h-3" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClassesHome() {
  const { user } = useAuthContext();
  const { organization } = useOrganizationContext();

  const firstName = user?.name?.split(" ")[0] ?? null;

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-zinc-900 py-12 px-6">
        <div className="container mx-auto flex items-end justify-between gap-4">
          <div>
            {firstName && (
              <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-3">
                Welcome back, {firstName}
              </p>
            )}
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">
              Browse Sessions
            </h1>
          </div>
          <Link
            href={ROUTES.DASHBOARD}
            className="text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white transition-colors shrink-0 mb-1"
          >
            My Bookings →
          </Link>
        </div>
      </div>

      {organization ? (
        <StudioAdminBar name={organization.name} />
      ) : (
        <StudioCTA />
      )}

      <div id="classes">
        <ClassSchedule />
      </div>
      <Footer />
    </div>
  );
}
