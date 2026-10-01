"use client";

import { createContext, use, type ReactNode } from "react";

import { browserHttp } from "@/lib/api/browser";
import { createApiClients, type ApiClients } from "@/lib/api/clients";

const defaultClients = createApiClients(browserHttp);
const ApiContext = createContext<ApiClients>(defaultClients);

/** Injects API clients; tests or stories can pass fakes instead of the real BFF transport. */
export function ApiProvider({ clients = defaultClients, children }: { clients?: ApiClients; children: ReactNode }) {
  return <ApiContext value={clients}>{children}</ApiContext>;
}

export const useApi = () => use(ApiContext);
