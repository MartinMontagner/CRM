import { create } from "zustand";

type SummaryState = {
  totalPendientes: number;
  aprobadosHoy: number;
  rechazadosHoy: number;
  totalUsuarios: number;
  setTotalPendientes: (n: number) => void;
  setAprobadosHoy: (n: number) => void;
  setRechazadosHoy: (n: number) => void;
  setTotalUsuarios: (n: number) => void;
};

export const useSummaryStore = create<SummaryState>((set) => ({
  totalPendientes: 0,
  aprobadosHoy: 0,
  rechazadosHoy: 0,
  totalUsuarios: 0,
  setTotalPendientes: (n) => set({ totalPendientes: n }),
  setAprobadosHoy: (n) => set({ aprobadosHoy: n }),
  setRechazadosHoy: (n) => set({ rechazadosHoy: n }),
  setTotalUsuarios: (n) => set({ totalUsuarios: n }),
}));