// client/src/state/index.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Определяем тип для пользователя (можно вынести в отдельный файл, например state/api.ts)
interface UserDetails {
  username: string;
  profilePictureUrl?: string;
}

// Обновляем интерфейс initialStateTypes, добавляя currentUser
export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  currentUser: UserDetails | null; // Добавляем currentUser
}

// Обновляем начальное состояние, добавляя currentUser
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
    // Опционально: добавьте редьюсер для установки currentUser
    setCurrentUser: (state, action: PayloadAction<UserDetails | null>) => {
      state.currentUser = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setCurrentUser } = globalSlice.actions;
export default globalSlice.reducer;