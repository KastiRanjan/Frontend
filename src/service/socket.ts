import { io, Socket } from "socket.io-client";

const backendURI = import.meta.env.VITE_BACKEND_URI;

export function initializeSocket(): Socket | null {
  // Get token from localStorage or 'Authentication' cookie
  let sessionToken = localStorage.getItem("access_token");
  if (!sessionToken) {
    const cookieString = document.cookie;
    const tokenMatch = cookieString.match(/(?:^|;\s*)Authentication=([^;]*)/);
    if (tokenMatch && tokenMatch[1]) {
      sessionToken = decodeURIComponent(tokenMatch[1]);
      localStorage.setItem("access_token", sessionToken);
    }
  }
  const userId = localStorage.getItem("userId");
  console.log('[Socket.io] Initializing socket with token:', sessionToken);
  console.log('[Socket.io] Initializing socket with userId:', userId);

  if (!sessionToken) {
    console.warn('[Socket.io] No session token found, socket not initialized');
    return null;
  }

  const socket = io(backendURI, {
    auth: {
      token: sessionToken
    }
  });

  socket.on("connect", () => console.log("[Socket.io] Socket connected!"));
  socket.on("connect_error", (err) => console.error("[Socket.io] Socket error:", err));

  return socket;
}
