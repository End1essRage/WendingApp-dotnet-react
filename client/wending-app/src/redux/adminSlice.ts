import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../api/api";
import { STATUS_BLANK, STATUS_FULLFILLED, STATUS_PENDING, STATUS_REJECTED } from "../constants/statuses";
import { Coin, CoinAdminReadDto, Drink, DrinkCreateDto, DrinkUpdateDto, UploadImageDto } from "../types";

interface AdminState {
	status: string,
	error: string,
	drinks: Array<Drink>,
	cash: Array<CoinAdminReadDto>,
	cashChanges: Array<Coin>
}

const initialState: AdminState = {
	status: STATUS_BLANK,
	error: '',
	drinks: Array<Drink>(),
	cash: Array<CoinAdminReadDto>(),
	cashChanges: Array<Coin>()
}
//Drinks
export const getDrinks = createAsyncThunk(
	'admin/getDrinks',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('http://localhost:5136/api/admin/drinks');

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
export const deleteDrink = createAsyncThunk(
	'admin/deleteDrink',
	async (id: number, { rejectWithValue, dispatch }) => {
		try {
			const response = await axios.delete('http://localhost:5136/api/admin/drinks/' + id);

			if (response.status === 400) {
				throw new Error('Bad request!');
			}
			if (response.status === 404) {
				throw new Error('Not Found!');
			}

			const data = await response.data;

			dispatch(removeDrink(id));

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
export const createDrink = createAsyncThunk(
	'admin/createDrink',
	async (drink: DrinkCreateDto, { rejectWithValue, dispatch }) => {
		try {
			const options = {
				method: 'POST',
				url: 'http://localhost:5136/api/admin/drinks',
				headers: {
					'Content-Type': 'application/json'
				},
				data: drink
			};

			const response = await axios.request(options);

			if (response.status === 400) {
				throw new Error('Bad request!');
			}
			if (response.status === 404) {
				throw new Error('Not Found!');
			}

			const data = await response.data;
			console.log(data);
			dispatch(removeDrink(0));
			dispatch(addDrink(data));
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
export const uploadDrink = createAsyncThunk(
	'admin/uploadDrink',
	async (drink: DrinkUpdateDto, { rejectWithValue, dispatch }) => {
		try {
			const options = {
				method: 'PATCH',
				url: 'http://localhost:5136/api/admin/drinks/' + drink.id,
				headers: {
					'Content-Type': 'application/json'
				},
				data: { price: drink.price, count: drink.count, rewrite: true }
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
export const uploadImage = createAsyncThunk(
	'admin/uploadImage',
	async (dto: UploadImageDto, { rejectWithValue, dispatch }) => {

		const formData = new FormData();
		formData.append("file", dto.image);

		try {
			const options = {
				method: 'POST',
				url: `http://localhost:5136/api/admin/drinks/${dto.id}/img`,
				headers: {
					'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001'
				},
				data: formData
			};

			const response = await axios.request(options)

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

//Cash
export const getCash = createAsyncThunk(
	'admin/getCash',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('http://localhost:5136/api/admin/cash');

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
export const updateCash = createAsyncThunk(
	'admin/updateCash',
	async (body: Array<Coin>, { rejectWithValue }) => {
		try {
			// Монеты на севере прибавляются и убавляются а не перезаписываются
			const options = {
				method: 'PUT',
				url: 'http://localhost:5136/api/admin/cash',
				headers: {
					'Content-Type': 'application/json'
				},
				data: body
			};

			const response = await axios.request(options)

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
export const switchCoin = createAsyncThunk(
	'admin/switchCoin',
	async (id: number, { rejectWithValue, dispatch }) => {
		try {
			const response = await axios.patch('http://localhost:5136/api/admin/cash/' + id);

			if (response.status === 400) {
				throw new Error('Bad request!');
			}
			if (response.status === 404) {
				throw new Error('Not Found!');
			}
			dispatch(switchCoinLock(id));
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

export const adminSlice = createSlice({
	name: 'admin',
	initialState,
	reducers: {
		addDrink(state: AdminState, action: PayloadAction<Drink>) {
			state.drinks.push(action.payload);
		},
		removeDrink(state: AdminState, action: PayloadAction<number>) {
			state.drinks = state.drinks.filter(d => d.id !== action.payload);
		},
		updateDrink(state: AdminState, action: PayloadAction<Drink>) {
			const index = state.drinks.findIndex(d => d.id === action.payload.id);
			state.drinks[index] = action.payload;
		},
		updateCoinChanges(state: AdminState, action: PayloadAction<Coin>) {
			const index = state.cashChanges.findIndex(c => c.nominal === action.payload.nominal);
			console.log(action.payload);
			if (index === -1) {
				state.cashChanges.push(action.payload);
			}
			else {
				state.cashChanges[index] = action.payload;
			}
		},
		switchCoinLock(state: AdminState, action: PayloadAction<number>) {
			return {
				...state,
				cash: state.cash.map(item =>
					item.nominal === action.payload ? { ...item, locked: !item.locked } : item
				)
			};
		}
	},
	extraReducers(builder) {
		builder.addCase(getDrinks.fulfilled, (state: AdminState, action: PayloadAction<Array<Drink>>) => {
			state.drinks = action.payload;
		});
		builder.addCase(getDrinks.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(deleteDrink.fulfilled, (state: AdminState, action) => {
			console.log(action.payload);
		});
		builder.addCase(deleteDrink.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(createDrink.fulfilled, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(createDrink.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(uploadDrink.fulfilled, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(uploadDrink.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(uploadImage.fulfilled, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(uploadImage.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(getCash.fulfilled, (state: AdminState, action: PayloadAction<CoinAdminReadDto[]>) => {
			state.cash = action.payload;
			console.log(action.payload);
		});
		builder.addCase(getCash.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(updateCash.fulfilled, (state: AdminState, action: PayloadAction<CoinAdminReadDto[]>) => {
			console.log(action.payload);
			state.cash = action.payload;
			state.cashChanges = new Array<Coin>()
		});
		builder.addCase(updateCash.rejected, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(switchCoin.fulfilled, (state, action) => {
			console.log(action.payload);
		});
		builder.addCase(switchCoin.rejected, (state, action) => {
			console.log(action.payload);
		});
	},
});

export const { addDrink, updateDrink, removeDrink, updateCoinChanges, switchCoinLock } = adminSlice.actions;

export default adminSlice.reducer;