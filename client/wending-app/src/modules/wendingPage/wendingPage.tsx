import { MouseEventHandler, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { WendingRequest, addCoin, addDrink, executeWending, fillGoods, getNominals } from "../../redux/wendingSlice";
import { DrinkItem } from "./drinksBlock/drinkItem";
import s from "./wendingPage.module.css";
import { CoinItem } from "./coinItem";
import { DrinksBlock } from "./drinksBlock/drinksBlock";

export const WendingPage = () => {

	const dispatch = useDispatch<AppDispatch>();



	const coins = useSelector((state: RootState) => state.wending.coins);

	const drinkData = useSelector((state: RootState) => state.wending.cart.reduce((acc, drink) => {
		return { ...acc, [drink.drinkId]: drink.count };
	}, {}));

	const coinData = useSelector((state: RootState) => state.wending.coins.reduce((acc, coin) => {
		return { ...acc, [coin.nominal]: coin.count };
	}, {}));

	const requestData: WendingRequest = {
		drinks: drinkData,
		coins: coinData,
	};


	const onCoinClick = (nominal: number) => {
		dispatch(addCoin(nominal));
	}

	const applyWending = () => {
		dispatch(executeWending(requestData));
	}

	return (
		<>
			<div className={s.Wrapper}>
				<DrinksBlock coins={coins} />
				<div className={s.CoinsBlock}>
					{coins.map((el) => <CoinItem nominal={el.nominal}
						count={el.count}
						onClickHandler={() => onCoinClick(el.nominal)} />)}
					<button onClick={applyWending}>Apply</button>
				</div>

			</div>
		</>
	);
}