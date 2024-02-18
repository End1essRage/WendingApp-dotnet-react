import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../api/api";
import { STATUS_BLANK, STATUS_FULLFILLED, STATUS_PENDING, STATUS_REJECTED } from "../constants/statuses";
import { Collection } from "typescript";
import { Coin, Drink } from "../types";

interface WendingState {
	status: string,
	error: string,
	cart: Array<CartPosition>,
	coins: Array<Coin>,
	goods: Array<Drink>,
	changeCoins: Array<Coin>,
	debt: number
}
export interface WendingRequest {
	drinks: { [key: number]: number };
	coins: { [key: number]: number };
}
export interface WendingResponse {
	coins: Array<Coin>;
	debt: number;
}

export const fillGoods = createAsyncThunk(
	'wending/fillGoods',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('http://localhost:5136/api/wending/drinks');

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

export const getNominals = createAsyncThunk(
	'wending/getNominals',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('http://localhost:5136/api/wending');

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

export const executeWending = createAsyncThunk(
	'wending/executeWending',
	async (request: WendingRequest, { rejectWithValue, dispatch }) => {
		try {
			const options = {
				method: 'POST',
				url: 'http://localhost:5136/api/wending',
				headers: { 'Content-Type': 'application/json', 'User-Agent': 'insomnia/8.6.1' },
				data: { drinks: request.drinks, coins: request.coins }
			};

			const response = await axios.request(options);

			if (response.status === 400) {
				throw new Error('Bad request!');
			}
			if (response.status === 404) {
				throw new Error('Not Found!');
			}

			const data = await response.data;
			dispatch(clearCoins());
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

class CartPosition {
	constructor(public drinkId: number, public count: number) { }
}

const initialState: WendingState = {
	status: STATUS_BLANK,
	error: '',
	cart: new Array<CartPosition>(),
	coins: new Array<Coin>(),
	goods: new Array<Drink>(),
	changeCoins: new Array<Coin>(),
	debt: 0
}

export const wendingSlice = createSlice({
	name: 'wending',
	initialState,
	reducers: {
		addCoin(state: WendingState, action: PayloadAction<number>) {
			const existingCoin = state.coins.find(coin => coin.nominal === action.payload);

			if (existingCoin) {
				return {
					...state,
					coins: state.coins.map(coin => coin.nominal === action.payload ? { ...coin, count: coin.count + 1 } : coin)
				};
			} else {
				return {
					...state,
					coins: [...state.coins, new Coin(action.payload, 1)]
				};
			}
		},
		addDrink(state: WendingState, action: PayloadAction<number>) {
			const existingDrink = state.cart.find(drink => drink.drinkId === action.payload);

			if (existingDrink) {
				return {
					...state,
					cart: state.cart.map(drink => drink.drinkId === action.payload ? { ...drink, count: drink.count + 1 } : drink),
					goods: state.goods.map(drink => drink.id === action.payload ? { ...drink, count: drink.count - 1 } : drink)
				};
			} else {
				return {
					...state,
					cart: [...state.cart, new CartPosition(action.payload, 1)],
					goods: state.goods.map(drink => drink.id === action.payload ? { ...drink, count: drink.count - 1 } : drink)
				};
			}
		},
		clearCoins(state: WendingState) {
			return {
				...state,
				coins: state.coins.map(coin => ({ ...coin, count: 0 }))
			};
		},
	},
	extraReducers(builder) {
		builder.addCase(fillGoods.fulfilled, (state, action: PayloadAction<Array<Drink>>) => {
			state.goods = action.payload
		});
		builder.addCase(fillGoods.rejected, (state, action) => {
			console.log('fillGoods error : payload - ' + action.payload + ' error: ' + action.error);
		});
		builder.addCase(getNominals.fulfilled, (state, action: PayloadAction<Array<number>>) => {
			state.coins = new Array<Coin>();
			action.payload.forEach((el) => {
				state.coins.push(new Coin(el, 0));
			})
		});
		builder.addCase(getNominals.rejected, (state, action) => {
			console.log('getNominals error : payload - ' + action.payload + ' error: ' + action.error);
		});
		builder.addCase(executeWending.fulfilled, (state, action: PayloadAction<WendingResponse>) => {
			state.cart = new Array<CartPosition>();
			state.changeCoins = action.payload.coins;
			console.log(action.payload)
			state.debt = action.payload.debt;
		});
		builder.addCase(executeWending.rejected, (state, action) => {
			console.log('getNominals error : payload - ' + action.payload + ' error: ' + action.error);
		});
	},
});

export const { addCoin, addDrink, clearCoins } = wendingSlice.actions;

export default wendingSlice.reducer;