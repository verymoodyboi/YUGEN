// src/layouts/AppLayout.tsx
import { useState } from "react";
import SideMenu from "../components/SideMenu";
import AccHub from "../components/AccountHub";
import NavBar from "../components/NavBar";
import TechnicalReportForm from "../features/report/components/TechReport";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [openReport, setOpenReport] = useState(false);
  const [openContact, setOpenContact] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-emerald-50 text-emerald-950">
      {/* Header */}
      <header className="h-[80px] min-h-[80px] w-full border-b-3 border-emerald-950 border-solid flex items-center px-4">
        <AccHub />
        <NavBar />
      </header>

      {/* Body */}
      <div className="flex flex-1 h-[90vh]">
        {/* Desktop Side Menu */}
        <aside className="hidden lg:block w-[18vw] min-w-[250px] h-full border-dashed border-r-8 border-emerald-950">
          <SideMenu
            mode="desktop"
            onOpenReport={() => setOpenReport(true)}
            onOpenContact={() => setOpenContact(true)}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full p-4 overflow-scroll">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <SideMenu
          mode="mobile"
          onOpenReport={() => setOpenReport(true)}
          onOpenContact={() => setOpenContact(true)}
        />
      </div>

      {/* === Technical Report Modal === */}
      {openReport && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenReport(false);
          }}
        >
          <div className=" max-w-lg p-4 " onClick={(e) => e.stopPropagation()}>
            <TechnicalReportForm
              onSubmitSuccess={async () => {
                setTimeout(() => setOpenReport(false), 2000);
              }}
            />
          </div>
        </div>
      )}

      {/* === Contact Modal === */}
      {openContact && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenContact(false);
          }}
        >
          <div
            className="bg-emerald-50 rounded-xl shadow-lg w-full max-w-sm p-6 border-2 border-emerald-950 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-freckle text-2xl text-emerald-950 ">
              Contact Information
            </h2>
            <ul className="space-y-2 text-emerald-950 ">
              <li>
                <strong>Email:</strong> support@try-yugen.com
              </li>
              <li>
                <strong>Address:</strong> All over the world! (until we can
                afford an office!)
              </li>
            </ul>
            <button
              onClick={() => setOpenContact(false)}
              className="w-full py-2 rounded-lg bg-emerald-950  text-emerald-50  font-freckle hover:scale-105 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
