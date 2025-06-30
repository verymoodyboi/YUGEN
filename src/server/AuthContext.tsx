import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../server/config";

type UserInfo = {
  username: string;
  pfp_path: string;
  user_id: number;
};

type AuthContextType = {
  user: UserInfo | null;
  email: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  email: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (session?.user) {
      setEmail(session.user.email);

      const { data, error } = await supabase
        .from("users")
        .select("username, pfp_path, user_id")
        .eq("email", session.user.email)
        .single();

      if (!error) {
        setUser(data);
      } else {
        console.error("Profile fetch error:", error);
        setUser(null);
      }
    } else {
      setUser(null);
      setEmail(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, email, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
