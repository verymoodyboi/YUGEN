import React from "react";
import { useState } from "react";
import { FiTwitter, FiInstagram, FiYoutube, FiFacebook } from "react-icons/fi";

interface NavLink {
  title: string;
  path: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: JSX.Element;
}

const FooterSection: React.FC = () => {
  const navigationLinks: NavLink[] = [
    { title: "Home", path: "#/" },
    { title: "About", path: "#/landing" },
    { title: "Login", path: "#/login" },
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
                src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Yugen%20Logo%20Vector%20FINAL.svg"
                alt="Yugen Logo"
                className="w-10 h-10 bg-emerald-50 rounded-full p-1 pl-3.5"
              />
              <span className="text-xl font-freckle text-emerald-50 tracking-wide">
                Yugen, INC
              </span>
            </div>
            <p className="text-emerald-100/70 text-sm max-w-xs">
              Don’t consume, but{" "}
              <span className="font-freckle text-emerald-700">CURATE.</span>{" "}
              Don’t generate, but{" "}
              <span className="font-freckle text-emerald-700">CREATE.</span>
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-3 flex-1 md:items-center">
            <h3 className="text-emerald-50 font-semibold mb-2">Navigation</h3>
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
              onClick={() => setOpenContact(true)}
              className="cursor-pointer text-emerald-100/80 hover:text-emerald-50 hover:translate-x-1 transition-all duration-200"
            >
              Conatct us
            </p>
          </nav>

          {/* Social Icons */}
          <div className="flex flex-col space-y-4 flex-1 md:items-end">
            <h3 className="text-emerald-50 font-semibold mb-2">Follow Us</h3>
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

        {/* Footer Text */}
        <div className="mt-12 pt-6 border-t border-emerald-800 w-full">
          <p className="text-sm text-emerald-100/60">
            © {new Date().getFullYear()} Yugen, INC. All rights reserved.
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
    </footer>
  );
};

export default FooterSection;
