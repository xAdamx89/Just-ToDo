export function getToken() {
  return localStorage.getItem("access_token");
}

export function isAuthenticated() {
  const token = getToken();
  return !!token; // true jeśli token istnieje
}

export const logout = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const setUser = (user: object) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export async function apiFetch(url: string, options: RequestInit = {}) {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${access}`,
    },
  });

  // Jeśli access wygasł
  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch("api/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access_token", data.access_token);

      // Ponów pierwotny request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access_token}`,
        },
      });
    } else {
      // Refresh też wygasł
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
}