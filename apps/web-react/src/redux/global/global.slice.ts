/**
 * global.slice.ts — UI state (sidebar collapse, modals...)
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface GlobalState {
  collapsed: boolean;
}

const initialState: GlobalState = {
  collapsed: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
  },
});

export const { setCollapsed, toggleCollapsed } = globalSlice.actions;

export default globalSlice.reducer;
