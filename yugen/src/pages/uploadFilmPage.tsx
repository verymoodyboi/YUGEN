// src/pages/UploadPage.tsx
import * as React from "react";
import AppLayout from "../layouts/layout-main";
import UploadForm from "../features/upload/components/UploadForm";

const UploadPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen  text-emerald-950 font-freckle p-6">
        <UploadForm />
      </div>
    </>
  );
};

export default UploadPage;
