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
  setPage: (page) => set(() => ({ page })),
  setLimit: (limit) => set(() => ({ limit })),
}));

export default usePagination;
