/** /src/store/uiSlice.ts */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Theme = "light" | "dark";
type UIState = { theme: Theme; userName?: string };

const initialState: UIState = { theme: "dark" };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setUserName(state, action: PayloadAction<string | undefined>) {
      state.userName = action.payload;
    },
  },
});

export const { setTheme, toggleTheme, setUserName } = uiSlice.actions;
export default uiSlice.reducer;