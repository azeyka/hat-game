import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({ reducer: { game: (state = { roomState: null }, action) => state } });
export type RootState = ReturnType<typeof store.getState>;
export { store };