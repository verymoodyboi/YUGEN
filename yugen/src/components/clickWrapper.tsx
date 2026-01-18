import React, { ReactElement, MouseEvent, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ClickableElement = ReactElement<{
  onClick?: (event: MouseEvent<any>) => void;
}>;

interface AuthActionGuardProps {
  children: ClickableElement;
}

const AuthActionGuard: React.FC<AuthActionGuardProps> = ({ children }) => {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = status === "authenticated";

  const handleClick = (event: MouseEvent<any>) => {
    if (!isAuthenticated) {
      event.preventDefault();
      event.stopPropagation();
      setShowModal(true);
      return;
    }

    // Call original child onClick if it exists
    children.props.onClick?.(event);
  };

  const handleLogin = () => {
    setShowModal(false);
    navigate("/login");
  };

  const handleBack = () => {
    setShowModal(false);
  };

  return (
    <>
      {React.cloneElement(children, { onClick: handleClick })}

      {showModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="relative flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] animate-modal-in w-full max-w-md mx-4">
              <button
                onClick={handleBack}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-center text-emerald-950">
                Opps looks like you are logged out!
              </h2>
              <p className="text-emerald-950/80 text-center">
                Please login to do continue.
              </p>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg border-2 border-emerald-950 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-lg border-2 border-emerald-950 bg-emerald-950 text-emerald-50 hover:scale-105 transition"
                >
                  Login
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AuthActionGuard;
