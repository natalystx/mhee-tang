import { authClient } from "@/lib/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getSession = async () => {
    const session = await authClient.getSession();
    setUser(session?.data?.user.email || null);
    setLoading(false);
  };

  useEffect(() => {
    getSession();
  }, []);

  return { user, loading };
};
