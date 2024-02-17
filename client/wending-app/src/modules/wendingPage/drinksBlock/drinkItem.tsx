import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import s from "../wendingPage.module.css";
import { MouseEventHandler } from "react";

interface DrinkProps {
	id: number,
	name: string,
	price: number,
	count: number,
	inCartCount: number,
	isLocked: boolean,
	onClickHandler: MouseEventHandler
}

export const DrinkItem = (props: DrinkProps) => {
	const imageSrc = `http://localhost:5136/api/wending/drinks/${props.id}/img`;

	if (props.isLocked || props.count < 1) {
		return (
			<>
				<div className={s.DrinkElement}>
					<img alt='' src={imageSrc}></img>
					<span className={s.DrinkName}>locked</span>
					<span className={s.DrinkPrice}>{props.price}</span>
				</div>
			</>
		);
	}
	else {
		return (
			<>
				<div className={s.DrinkElement} onClick={props.onClickHandler}>
					<img alt='' src={imageSrc}></img>
					<span className={s.DrinkName}>{props.name}</span>
					<span className={s.DrinkPrice}>price = {props.price}</span>
					<span>Selected = {props.inCartCount}</span>
				</div>
			</>
		);
	}


}