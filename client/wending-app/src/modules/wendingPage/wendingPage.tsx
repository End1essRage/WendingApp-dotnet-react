import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { addCoin, executeWending, } from "../../redux/wendingSlice";
import s from "./wendingPage.module.css";
import { CoinItem } from "./coinItem";
import { DrinksBlock } from "./drinksBlock/drinksBlock";
import { WendingRequest } from "../../types";

export const WendingPage = () => {

	const dispatch = useDispatch<AppDispatch>();

	const coins = useSelector((state: RootState) => state.wending.coins);
	const changeCoins = useSelector((state: RootState) => state.wending.changeCoins);
	const debt = useSelector((state: RootState) => state.wending.debt);

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
	const onChangeCoinClick = (nominal: number) => {
		//clear change coins
		//dispatch(addCoin(nominal));
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
				<p>Сдача:</p>
				<div className={s.CoinsBlock}>
					{changeCoins.map((el) => <CoinItem nominal={el.nominal}
						count={el.count}
						onClickHandler={() => onChangeCoinClick(el.nominal)} />)}
					{debt > 0 ? <p>Debt is {debt}</p> : <></>}<p></p>
				</div>
			</div>
		</>
	);
}