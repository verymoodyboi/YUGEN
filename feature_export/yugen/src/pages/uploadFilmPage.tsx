// src/pages/UploadPage.tsx
import * as React from "react";
import AppLayout from "../layouts/layout-main";
import UploadForm from "../features/upload/components/UploadForm";

const UploadPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-emerald-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 font-freckle p-6">
        <UploadForm />
      </div>
    </AppLayout>
  );
};

export default UploadPage;
