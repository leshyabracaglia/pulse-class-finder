"use client";

import { Building } from "lucide-react";
import OrganizationClassesDisplay from "./OrganizationClassesDisplay";

export default function OrganizationClasses() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Organization Classes
              </h1>
              <p className="text-sm text-gray-600">
                Manage your organization classes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <OrganizationClassesDisplay />
        </div>
      </div>
    </div>
  );
}
