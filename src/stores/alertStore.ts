import { create } from "zustand";

export type AlertType = "success" | "error" | "warning" | "info";

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    body?: string;
    duration?: number;
}

interface AlertStore {
    alerts: Alert[];
    push: (alert: Omit<Alert, "id">) => void;
    dismiss: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],

    push: (alert) => {
        const id = crypto.randomUUID();
        set((s) => ({ alerts: [...s.alerts, { ...alert, id }] }));
    },

    dismiss: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
}));

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const toast = {
    success: (title: string, body?: string, duration?: number) =>
        useAlertStore.getState().push({ type: "success", title, body, duration }),

    error: (title: string, body?: string, duration?: number) =>
        useAlertStore.getState().push({ type: "error", title, body, duration }),

    warning: (title: string, body?: string, duration?: number) =>
        useAlertStore.getState().push({ type: "warning", title, body, duration }),

    info: (title: string, body?: string, duration?: number) =>
        useAlertStore.getState().push({ type: "info", title, body, duration }),
};