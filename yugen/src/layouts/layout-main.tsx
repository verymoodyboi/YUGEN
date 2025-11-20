// src/layouts/AppLayout.tsx
import { useState } from "react";
import SideMenu from "../components/SideMenu";
import AccHub from "../components/AccountHub";
import NavBar from "../components/NavBar";
import TechnicalReportForm from "../features/report/components/TechReport";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [openReport, setOpenReport] = useState(false);
  const [openContact, setOpenContact] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-emerald-50 text-emerald-950">
      {/* Header */}
      <header className="h-[80px] min-h-[80px] w-full border-b-4 border-emerald-950 border-dashed flex items-center px-4">
        <AccHub />
        <NavBar />
      </header>

      {/* Body */}
      <div className="flex flex-1 h-[90vh]">
        {/* Desktop Side Menu */}
        <aside className="hidden lg:block w-[18vw] h-full border-dashed  border-r-4 border-emerald-950">
          <SideMenu
            mode="desktop"
            onOpenReport={() => setOpenReport(true)}
            onOpenContact={() => setOpenContact(true)}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full p-4 overflow-scroll">{children}</main>
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
          <div
            className="bg-emerald-50 dark:bg-emerald-950 rounded-xl shadow-lg w-full max-w-lg p-4 border-2 border-emerald-950"
            onClick={(e) => e.stopPropagation()}
          >
            <TechnicalReportForm onSubmitSuccess={() => setOpenReport(false)} />
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
            className="bg-emerald-50 dark:bg-emerald-950 rounded-xl shadow-lg w-full max-w-sm p-6 border-2 border-emerald-950 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-freckle text-2xl text-emerald-950 dark:text-emerald-50">
              Contact Information
            </h2>
            <ul className="space-y-2 text-emerald-950 dark:text-emerald-50">
              <li>
                <strong>Email:</strong> support@yugen.film
              </li>
              <li>
                <strong>Address:</strong> All over the world.
              </li>
            </ul>
            <button
              onClick={() => setOpenContact(false)}
              className="w-full py-2 rounded-lg bg-emerald-950 dark:bg-emerald-50 text-emerald-50 dark:text-emerald-950 font-freckle hover:scale-105 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
