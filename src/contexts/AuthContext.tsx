import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../server/config";
import { Session, User } from "@supabase/supabase-js";

type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated"
  | "signupGoogle";

interface AuthContextType {
  user: any | null;
  session: Session | null;
  status: AuthStatus;
  userInfo: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: "loading",
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const [userInfo, setUserInfo] = useState<any>(null);
  const [user, setUser] = useState<any>();
  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    const displayName = user?.user_metadata?.display_name;
    // console.log("Display Name:", displayName);
    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();
      if (!error) {
        setUserInfo(data);
        // console.log("User data loaded:", data);
      } else {
        console.error("Error loading user profile:", error);
      }
    } else {
      setUserInfo(null); // Clear info if no user
    }
  };

  useEffect(() => {
    loadProfile(); // Initial load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        loadProfile(); // Refresh profile on login/logout
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, session, status, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
