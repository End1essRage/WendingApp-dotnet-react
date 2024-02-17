import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import adminReducer from "./adminSlice";
import wendingReducer from "./wendingSlice";


export const store = configureStore({
	reducer: {
		auth: authReducer,
		admin: adminReducer,
		wending: wendingReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredPaths: ['wending'],
			}
		})
})

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;