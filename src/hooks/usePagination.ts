import { create } from "zustand";

interface PaginationState {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const usePagination = create<PaginationState>((set) => ({
  page: 1,
  limit: 10,
  setPage: (page) => set((state) => ({ page })),
  setLimit: (limit) => set((state) => ({ limit })),
}));

export default usePagination;
