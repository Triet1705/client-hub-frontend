"use client";

import * as React from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getAuthToken } from "@/lib/cookies";
import { ACCESS_TOKEN_REFRESHED_EVENT } from "@/lib/axios";

type RealtimeMessageHandler = (message: IMessage) => void;

interface RealtimeContextValue {
  isConnected: boolean;
  subscribe: (
    destination: string,
    handler: RealtimeMessageHandler,
  ) => (() => void);
}

const RealtimeContext = React.createContext<RealtimeContextValue>({
  isConnected: false,
  subscribe: () => () => undefined,
});

function resolveWebSocketUrl(): string {
  const configuredApiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const base =
    typeof window !== "undefined"
      ? new URL(configuredApiUrl, window.location.origin)
      : new URL(configuredApiUrl);
  return `${base.origin}/ws`;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const clientRef = React.useRef<Client | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [tokenVersion, setTokenVersion] = React.useState(0);

  React.useEffect(() => {
    const handleTokenRefresh = () => setTokenVersion((version) => version + 1);
    window.addEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handleTokenRefresh);
    return () =>
      window.removeEventListener(
        ACCESS_TOKEN_REFRESHED_EVENT,
        handleTokenRefresh,
      );
  }, []);

  React.useEffect(() => {
    const token = getAuthToken();
    if (!isAuthenticated || !userId || !token) {
      setIsConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(resolveWebSocketUrl()),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => undefined,
    });

    client.onConnect = () => setIsConnected(true);
    client.onDisconnect = () => setIsConnected(false);
    client.onWebSocketClose = () => setIsConnected(false);
    client.onStompError = () => setIsConnected(false);

    clientRef.current = client;
    client.activate();

    return () => {
      if (clientRef.current === client) {
        clientRef.current = null;
      }
      setIsConnected(false);
      void client.deactivate();
    };
  }, [isAuthenticated, tokenVersion, userId]);

  const subscribe = React.useCallback(
    (destination: string, handler: RealtimeMessageHandler) => {
      const client = clientRef.current;
      if (!client?.connected) {
        return () => undefined;
      }

      let subscription: StompSubscription | null = client.subscribe(
        destination,
        handler,
      );
      return () => {
        subscription?.unsubscribe();
        subscription = null;
      };
    },
    [],
  );

  const value = React.useMemo(
    () => ({ isConnected, subscribe }),
    [isConnected, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>
      <span
        className="sr-only"
        data-testid="realtime-connection-status"
        data-connected={isConnected}
        aria-live="polite"
      >
        Realtime {isConnected ? "connected" : "disconnected"}
      </span>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeConnection() {
  return React.useContext(RealtimeContext);
}
