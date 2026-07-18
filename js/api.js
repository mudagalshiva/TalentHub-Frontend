(function () {
  const BASE_URL ="https://talenthub-backend-6ncr.onrender.com/api";
  const TOKEN_KEY = "talenthub_token";
  const USER_KEY = "talenthub_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        localStorage.removeItem(USER_KEY);
      }
    }
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return {
        id: payload.id || payload.userId || payload.sub,
        name: payload.name || payload.fullName || payload.sub || "TalentHub user",
        email: payload.email || payload.sub,
        role: normalizeRole(payload.role || payload.roles || payload.authorities)
      };
    } catch (error) {
      return null;
    }
  }

  function normalizeRole(role) {
    if (Array.isArray(role)) role = role[0];
    if (role && typeof role === "object") role = role.authority || role.name;
    const value = String(role || "CANDIDATE").replace("ROLE_", "").toUpperCase();
    if (value.includes("ADMIN")) return "ADMIN";
    if (value.includes("RECRUITER")) return "RECRUITER";
    return "CANDIDATE";
  }

  function buildQuery(params) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, value);
    });
    const text = query.toString();
    return text ? `?${text}` : "";
  }

  async function request(path, options = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers || {});
    if (!isFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) {
    headers.set("Authorization", `Bearer ${token}`);
}

  console.log("=================================");
  console.log("API :", `${API_BASE_URL}${path}`);
  console.log("TOKEN :", token);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      const message = data?.message || data?.error || data || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      if (response.status === 401) clearSession();
      throw error;
    }

    return data;
  }

  const api = {
    API_BASE_URL,
    TOKEN_KEY,
    USER_KEY,
    getToken,
    getUser,
    setSession,
    clearSession,
    normalizeRole,
    buildQuery,
    request,
    get: (path, params) => request(`${path}${buildQuery(params)}`),
    post: (path, body) => request(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
    put: (path, body) => request(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
    patch: (path, body) => request(path, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
    delete: (path) => request(path, { method: "DELETE" })
  };

  window.TalentAPI = api;
})();
