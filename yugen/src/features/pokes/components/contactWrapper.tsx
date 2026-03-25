import React, { ReactElement, MouseEvent, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Mail, Phone } from "lucide-react";
import { api } from "../../../lib/api";
import { useToast } from "../../../components/toaster";

type ClickableElement = ReactElement<{
  onClick?: (event: MouseEvent<any>) => void;
}>;

interface ContactInfoGuardProps {
  children: ClickableElement;
}

interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{6,15}$/;

const ContactInfoGuard: React.FC<ContactInfoGuardProps> = ({ children }) => {
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+965");

  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Load country codes
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://assets.try-yugen.com/CountryCodes.json",
        );
        const data = await res.json();
        setCountries(data);
      } catch {
        toast.error("Failed to load country codes");
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, [toast]);

  const checkContactInfo = async () => {
    const res = await api.get("/profile/contact");
    return res.data;
  };

  const saveContactInfo = async () => {
    await api.post("/profile/contact", {
      contactEmail: email || null,
      contactNumber: phone ? `(${countryCode}) ${phone}` : null,
    });
  };

  const validate = () => {
    let valid = true;

    setEmailError("");
    setPhoneError("");

    if (!email && !phone) {
      toast.warn("Add at least email or WhatsApp");
      return false;
    }

    if (email && !emailRegex.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }

    if (phone && !phoneRegex.test(phone)) {
      setPhoneError("Phone must be 6–15 digits");
      valid = false;
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      await saveContactInfo();
      toast.success("Contact info saved successfully");
      setShowModal(false);
    } catch {
      toast.error("Failed to save contact info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: async (event: MouseEvent<any>) => {
          if (checking) return;

          setChecking(true);

          try {
            const data = await checkContactInfo();

            const hasEmail = !!data.contact_email;
            const hasPhone = !!data.contact_number;

            if (!hasEmail && !hasPhone) {
              event.preventDefault();
              event.stopPropagation();
              setShowModal(true);
              return;
            }

            children.props.onClick?.(event);
          } catch {
            toast.error("Unable to verify contact info");
          } finally {
            setChecking(false);
          }
        },
      })}

      {showModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
              className="
              relative flex flex-col w-full h-full sm:h-auto sm:max-h-[90vh]
              sm:max-w-md
              bg-emerald-50 border-t-4 sm:border-4 border-emerald-950
              rounded-none sm:rounded-2xl
              shadow-[6px_6px_0_#064e3b]
            "
            >
              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-xl rounded-full border-2 border-emerald-950 hover:bg-emerald-100"
              >
                ×
              </button>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                <h2 className="text-2xl font-bold text-center text-emerald-950">
                  Add Contact Info
                </h2>

                <p className="text-center text-emerald-900/80 text-sm">
                  Add contact details so collaborators can reach you.
                </p>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full p-2 rounded-lg border-2 bg-white focus:outline-none focus:ring-2 ${
                      emailError
                        ? "border-red-500 focus:ring-red-400"
                        : "border-emerald-950 focus:ring-emerald-400"
                    }`}
                  />

                  {emailError && (
                    <span className="text-xs text-red-500">{emailError}</span>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Phone size={16} />
                    WhatsApp
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={loadingCountries}
                      className="p-2 rounded-lg border-2 border-emerald-950 bg-white max-w-[120px]"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.dial_code}>
                          {c.dial_code}
                        </option>
                      ))}
                    </select>

                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="51579287"
                      className={`flex-1 p-2 rounded-lg border-2 bg-white focus:outline-none focus:ring-2 ${
                        phoneError
                          ? "border-red-500 focus:ring-red-400"
                          : "border-emerald-950 focus:ring-emerald-400"
                      }`}
                    />
                  </div>

                  {phoneError && (
                    <span className="text-xs text-red-500">{phoneError}</span>
                  )}

                  <div className="text-xs text-emerald-800 mt-1">
                    Format: ({countryCode}) {phone || "XXXXXXXX"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t-2 border-emerald-950 flex justify-center gap-4 bg-emerald-50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border-2 border-emerald-950 hover:bg-emerald-100"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg border-2 border-emerald-950 bg-emerald-950 text-emerald-50 hover:scale-105 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ContactInfoGuard;
