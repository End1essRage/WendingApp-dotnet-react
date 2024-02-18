import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { addDrink, fillGoods } from "../../../redux/wendingSlice";
import { Coin, Drink } from "../../../types";
import { DrinkItem } from "./drinkItem";
import s from "../wendingPage.module.css";

interface DrinksBlockProps {
	coins: Array<Coin>
}

export const DrinksBlock = (props: DrinksBlockProps) => {

	const dispatch = useDispatch<AppDispatch>();

	const goods = useSelector((state: RootState) => state.wending.goods);
	const cart = useSelector((state: RootState) => state.wending.cart);


	const getDrinksInCartCount = (drinkId: number) => {
		const cartItem = cart.find(c => c.drinkId === drinkId);
		return cartItem !== undefined ? cartItem.count : 0;
	}

	const onDrinkClick = (drinkId: number) => {
		dispatch(addDrink(drinkId));
	}

	const calculateTotalMoney = () => {
		let totalCoins = 0;
		let totalCart = 0;
		props.coins.map((el) => totalCoins += el.count * el.nominal);
		cart.map((el) => {
			let drink = goods.find(g => g.id === el.drinkId);
			let price = drink !== undefined ? drink.price : 0;
			totalCart += el.count * price;
		});
		return totalCoins - totalCart;
	}

	return (
		<>
			<div className={s.DrinksBlock}>

				{goods.map((el) => <DrinkItem key={el.id}
					isLocked={calculateTotalMoney() < el.price}
					id={el.id}
					name={el.name}
					price={el.price}
					count={el.count}
					inCartCount={getDrinksInCartCount(el.id)}
					onClickHandler={() => onDrinkClick(el.id)} />)}
			</div>
			<p>Доступно {calculateTotalMoney()}</p>
		</>
	);
}
