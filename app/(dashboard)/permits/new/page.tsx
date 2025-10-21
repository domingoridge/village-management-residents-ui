/**
 * New Permit Application Page
 *
 * Entry point for creating a new permit application.
 * Renders the PermitWizard component.
 */

import { PermitWizard } from "@/components/features/permits/PermitWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Permit Application",
  description:
    "Submit a new permit application for construction, renovation, electrical, or plumbing work",
};

export default function NewPermitPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral">
          New Permit Application
        </h1>
        <p className="mt-2 text-neutral/70">
          Complete the form below to submit your permit application
        </p>
      </div>

      <PermitWizard />
    </div>
  );
}
