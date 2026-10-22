import { create } from 'zustand'

type CounterState = {
  count: number
}

type CounterActions = {
  increase: () => void
  decrease: () => void
  reset: () => void
}
export const useCounterStore = create<CounterState & CounterActions>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))
