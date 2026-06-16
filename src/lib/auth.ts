// Helpers de autenticación (token en localStorage).
const TOKEN_KEY = "dashboard_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Llamado por el cliente API cuando una petición devuelve 401:
// limpia el token y recarga para que AuthGate muestre el login.
export function handleUnauthorized() {
  clearToken();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.reload();
  }
}
