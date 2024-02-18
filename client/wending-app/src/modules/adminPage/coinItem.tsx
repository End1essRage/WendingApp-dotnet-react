import { MouseEventHandler, useState } from "react";
import s from "./adminPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { switchCoin, updateCoinChanges } from "../../redux/adminSlice";
import { Coin } from "../../types";

interface CoinItemProps {
	nominal: number,
	count: number,
	locked: boolean,
	handleLockClick: MouseEventHandler,
	backgroundColor: string
}


export const CoinItem = (props: CoinItemProps) => {
	const dispatch = useDispatch<AppDispatch>();

	const cchanges = useSelector((state: RootState) => state.admin.cashChanges.find(c => c.nominal === props.nominal));

	const handleIncrement = () => {
		const newChanges = cchanges === undefined ? 1 : cchanges.count + 1;
		dispatch(updateCoinChanges(new Coin(props.nominal, newChanges)));
	};

	const handleDecrement = () => {
		if (cchanges !== undefined) {
			if (cchanges.count + props.count > 0) {
				const newChanges = cchanges.count - 1;
				dispatch(updateCoinChanges(new Coin(props.nominal, newChanges)));
			}
		}
		else {
			const newChanges = props.count === 0 ? 0 : -1;
			dispatch(updateCoinChanges(new Coin(props.nominal, newChanges)));
		}

	};

	return (
		<div className={s.CashItem} style={{ backgroundColor: props.backgroundColor }}>
			<button onClick={props.handleLockClick}>block / unblock</button>
			<p>Nominal - {props.nominal}</p>
			<p>Count - {props.count}</p>
			<button onClick={handleIncrement}>+</button>
			<p>{cchanges === undefined ? 0 : cchanges.count}</p>
			<button onClick={handleDecrement}>-</button>
		</div>
	);
}