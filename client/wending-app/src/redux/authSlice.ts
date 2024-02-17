import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../api/api";
import { STATUS_BLANK, STATUS_FULLFILLED, STATUS_PENDING, STATUS_REJECTED } from "../constants/statuses";

interface AuthState {
	status: string,
	error: string,
	authenticated: boolean
}

const initialState: AuthState = {
	status: STATUS_BLANK,
	error: '',
	authenticated: false
}

export const login = createAsyncThunk(
	'auth/login',
	async (key: string, { rejectWithValue }) => {
		try {

			const options = {
				method: 'POST',
				url: 'http://localhost:5136/api/admin/auth',
				params: { key: key },
			};

			const response = await axios.request(options);

			if (response.status === 400) {
				throw new Error('Bad request!');
			}
			if (response.status === 404) {
				throw new Error('Not Found!');
			}

			const data = await response.data;

			return data;
		}
		catch (error) {
			let message = '';

			if (error instanceof Error)
				message = error.message;

			return rejectWithValue(message);
		}
	}
);

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
	},
	extraReducers(builder) {
		builder.addCase(login.pending, (state, action) => {
			state.status = STATUS_PENDING;
		})
		builder.addCase(login.fulfilled, (state, action) => {
			state.status = STATUS_FULLFILLED;
			state.authenticated = true;
		})
		builder.addCase(login.rejected, (state, action) => {
			state.status = STATUS_REJECTED;
			console.log(action.payload);
		})
	},
});

export default authSlice.reducer;