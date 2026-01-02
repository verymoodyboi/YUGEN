import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import supabase from "../lib/supabaseClient"; // still needed for session/token
import axios from "axios";
import { Session } from "@supabase/supabase-js";

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
  getAccessToken: () => Promise<string | null>;
  username: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: "loading",
  getAccessToken: async () => null,
  userInfo: null,
  username: "",
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setStatus("unauthenticated");
        setUser(null);
        setUserInfo(null);
        return;
      }

      const { data } = await axios.get("https://try-yugen.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data.user);
      setUserInfo(data.userInfo || null);

      if (data.userInfo?.username) {
        setUsername(data.userInfo.username);
      }

      setStatus(data.userInfo ? "authenticated" : "signupGoogle");
    } catch (err) {
      console.error("Error loading profile:", err);
      setStatus("unauthenticated");
    }
  }, [getAccessToken]);

  useEffect(() => {
    loadProfile(); // initial load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state change:", _event);
        setSession(session);
        loadProfile();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{ user, session, status, userInfo, getAccessToken, username }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
