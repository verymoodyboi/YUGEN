import * as React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      {/* Page Title */}
      <h2 className="font-freckle text-3xl mb-6 text-emerald-950 dark:text-emerald-50">
        Privacy Policy
      </h2>

      {/* PDF Container */}
      <div className="relative w-full h-[75vh] rounded-3xl overflow-hidden border border-emerald-950/30 dark:border-emerald-50/20 shadow-lg bg-emerald-50 dark:bg-emerald-950">
        {/* Subtle header bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-emerald-950/90 dark:bg-emerald-950 text-emerald-50">
          <span className="font-freckle text-lg">
            Yūgen Studios — Privacy Policy
          </span>

          <a
            href="/yugen-privacy-policy.pdf"
            download
            className="text-sm underline opacity-90 hover:opacity-100"
          >
            Download PDF
          </a>
        </div>

        {/* PDF Viewer */}
        <iframe
          src="/yugen-privacy-policy.pdf"
          title="Privacy Policy PDF"
          className="w-full h-full pt-12"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
