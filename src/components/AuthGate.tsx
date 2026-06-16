import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Login from "@/pages/Login";
import { Skeleton } from "@/components/ui/skeleton";

// Controla el acceso: si la auth está habilitada en el backend y no hay token, muestra el login.
// Si está deshabilitada (sin contraseña configurada), deja pasar.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "login">("loading");

  useEffect(() => {
    let active = true;
    api.getAuthStatus().then((res) => {
      if (!active) return;
      const enabled = res.data?.enabled ?? false;
      if (!enabled || getToken()) setState("ok");
      else setState("login");
    });
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Skeleton className="h-40 w-full max-w-sm" />
      </div>
    );
  }

  if (state === "login") {
    return <Login onSuccess={() => setState("ok")} />;
  }

  return <>{children}</>;
}
