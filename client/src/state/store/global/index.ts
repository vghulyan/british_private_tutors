import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";
import { MenuItem, NavigationItem } from "@/state/dataTypes/interfaces";

export type SerializableMenuItem = Omit<MenuItem, "icon">;

export interface InitialStateTypes {
  navigationItems: NavigationItem[];
  selectedMenuItem: SerializableMenuItem | null;
}

const initialState: InitialStateTypes = {
  navigationItems: [],
  selectedMenuItem: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setNavigationItems(state, action: PayloadAction<NavigationItem[]>) {
      state.navigationItems = action.payload;
    },
    selectMenuItem(state, action: PayloadAction<SerializableMenuItem>) {
      state.selectedMenuItem = action.payload;
    },
    clearMenuItems: (state) => {
      state.navigationItems = [];
      state.selectedMenuItem = null;
    },
  },
});

export const { setNavigationItems, selectMenuItem, clearMenuItems } =
  globalSlice.actions;

export const selectedNavigationItems = (state: RootState) =>
  state.global.navigationItems;

export const currentMenuItem = (state: RootState) =>
  state.global.selectedMenuItem;

export default globalSlice.reducer;
