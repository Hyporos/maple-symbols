import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface SelectorState {
  swapped: boolean;
}

const initialState: SelectorState = {
  swapped: false,
};

const selectorSlice = createSlice({
  name: "selector",
  initialState,
  reducers: {
    setSwapped: (state, action: PayloadAction<boolean>) => {
      state.swapped = action.payload;
    },
  },
});

export const { setSwapped } = selectorSlice.actions;

export default selectorSlice.reducer;
