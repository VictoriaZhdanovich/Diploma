import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from './api'; // Импортируем тип User из api.ts

// Обновляем интерфейс initialStateTypes
export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  currentUser: User | null; // Используем тип User из api.ts
}

// Обновляем начальное состояние
const initialState: initialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  currentUser: null, // Изначально пользователь не авторизован (null)
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setCurrentUser } = globalSlice.actions;
export default globalSlice.reducer;