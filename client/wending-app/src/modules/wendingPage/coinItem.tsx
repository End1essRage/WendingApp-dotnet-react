import { MouseEventHandler } from "react";
import s from "./wendingPage.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface CoinProps {
	nominal: number,
	count: number,
	onClickHandler: MouseEventHandler
}

export const CoinItem = (props: CoinProps) => {

	return (
		<>
			<div className={s.CoinItem} onClick={props.onClickHandler}>
				<span>{props.nominal} X {props.count}</span>
			</div>
		</>
	);
}