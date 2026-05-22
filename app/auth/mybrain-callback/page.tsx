"use client";

import { useEffect } from "react";

export default function MyBrainAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("auth_token");
    const refreshToken = params.get("auth_refresh");

    if (token) {
      localStorage.setItem("mybrain-auth-token", token);
      if (refreshToken) {
        localStorage.setItem("mybrain-auth-refresh", refreshToken);
      }
      window.location.href = "/#/auth";
    } else {
      const error = params.get("error") || "Authentication failed";
      window.location.href = `/#/auth?error=${encodeURIComponent(error)}`;
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p>Authenticating with My Brain...</p>
    </div>
  );
}
