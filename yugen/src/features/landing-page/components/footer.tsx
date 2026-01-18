import React from "react";
import { useState } from "react";
import { FiTwitter, FiInstagram, FiYoutube, FiFacebook } from "react-icons/fi";
import footer_logo from "../../../YugenAssits/logo/Yugen Logo (Outline).svg";
interface NavLink {
  title: string;
  path: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: any;
}

const FooterSection: React.FC<{ scrollToTop: () => void }> = ({
  scrollToTop,
}) => {
  const navigationLinks: NavLink[] = [
    { title: "Home", path: "/login" },
    { title: "Login", path: "/login" },
    { title: "Terms and Conditions", path: "/terms" },
{ title: "Privacy Policy", path: "/yugen-privacy-policy.html" },
  ];

  const socialLinks: SocialLink[] = [
    { name: "Instagram", href: "#", icon: <FiInstagram /> },
    { name: "YouTube", href: "#", icon: <FiYoutube /> },
  ];
  const [openContact, setOpenContact] = useState(false);

  return (
    <footer className="w-full bg-emerald-950 py-12 m-0 p-0">
      {/* Background Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('/grain.png')] bg-repeat"></div>

      <div className="w-full px-6 m-0 max-w-none">
        {/* Main Footer Content - Left Aligned */}
        <div className="flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0 w-full">
          {/* Logo + Company */}
          <div className="flex flex-col space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <img
                src={footer_logo}
                alt="Yugen Logo"
                className="w-[80px] h-[80px] object-contain rounded-full  p-0.5 overflow-visible"
                style={{ objectPosition: "center" }}
              />

              <span className="text-xl title text-emerald-50 tracking-wide">
                Yūgen Studios
              </span>
            </div>

            <p className="text-emerald-100/70 text-sm max-w-xs">
              Don’t consume, but{" "}
              <span className="title text-emerald-700">CURATE.</span> Don’t
              generate, but{" "}
              <span className="title text-emerald-700">CREATE.</span>
            </p>
          </div>

          <nav className="flex flex-col space-y-3 flex-1 md:items-center">
            <h3 className="text-emerald-50 title text-xl">Navigate</h3>
            {navigationLinks.map((link) => (
              <a
                key={link.title}
                href={link.path}
                className="text-emerald-100/80 hover:text-emerald-50 hover:translate-x-1 transition-all duration-200"
              >
                {link.title}
              </a>
            ))}
            <p
              onClick={() => scrollToTop()}
              className="cursor-pointer text-emerald-100/80 hover:text-emerald-50 hover:translate-x-1 transition-all duration-200"
            >
              About
            </p>
            <p
              onClick={() => setOpenContact(true)}
              className="cursor-pointer text-emerald-100/80 hover:text-emerald-50 hover:translate-x-1 transition-all duration-200"
            >
              Contact us
            </p>
          </nav>

          <div className="flex flex-col space-y-4 flex-1 md:items-end">
            <h3 className="text-emerald-50 title text-xl">Follow Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-900/50 border border-emerald-700/30 hover:bg-emerald-800 hover:scale-110 transition-all duration-200"
                  title={social.name}
                >
                  {React.cloneElement(social.icon, {
                    className: "w-5 h-5 text-emerald-50",
                  })}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-emerald-800 w-full">
          <p className="text-sm text-emerald-100/60">
            © https://try-yugen.com All rights reserved.
          </p>
        </div>
      </div>
      {openContact && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenContact(false);
          }}
        >
          <div
            className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                setOpenContact(false);
              }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
            >
              ×
            </button>
            <h2 className="font-freckle text-2xl text-emerald-950 dark:text-emerald-50">
              Contact Information
            </h2>
            <ul className="space-y-2 text-emerald-950 dark:text-emerald-50">
              <li>
                <strong>Email:</strong> support@try-yugen.com
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
    </footer>
  );
};

export default FooterSection;
