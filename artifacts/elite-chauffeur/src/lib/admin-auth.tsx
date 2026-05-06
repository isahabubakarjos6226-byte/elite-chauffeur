import { createContext, useContext, useState, ReactNode } from "react";

const AUTH_KEY = "elite_admin_auth_v2";

export type AdminRole = "super_admin" | "admin" | "user";

interface AuthData {
  role: AdminRole;
  name: string;
  userId?: number;
}

interface AdminAuthContext {
  isAuthenticated: boolean;
  role: AdminRole | null;
  userName: string | null;
  userId: number | null;
  isAdmin: boolean;
  login: (password: string, email?: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthCtx = createContext<AdminAuthContext | null>(null);

function loadAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(() => loadAuth());

  const login = async (password: string, email?: string): Promise<boolean> => {
    try {
      const body: Record<string, string> = { password };
      if (email && email.trim()) body.email = email.trim().toLowerCase();

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json() as { success: boolean; role: AdminRole; name: string; userId?: number };
        const auth: AuthData = { role: data.role, name: data.name ?? "Administrator", userId: data.userId };
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
        setAuthData(auth);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("elite_admin_auth");
    setAuthData(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      return data;
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const isAuthenticated = authData !== null;
  const role = authData?.role ?? null;
  const isAdmin = role === "super_admin" || role === "admin";

  return (
    <AdminAuthCtx.Provider value={{
      isAuthenticated,
      role,
      userName: authData?.name ?? null,
      userId: authData?.userId ?? null,
      isAdmin,
      login,
      logout,
      changePassword,
    }}>
      {children}
    </AdminAuthCtx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthCtx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
