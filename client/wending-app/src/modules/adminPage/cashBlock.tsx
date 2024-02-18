import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { CoinItem } from "./coinItem";
import { switchCoin } from "../../redux/adminSlice";

export const CashBlock: React.FC = () => {

	const coins = useSelector((state: RootState) => state.admin.cash);
	const dispatch = useDispatch<AppDispatch>();

	const handleLockClick = (nominal: number) => {
		dispatch(switchCoin(nominal));
	}

	return (
		<>
			{coins.map((coin) => (
				<CoinItem backgroundColor={coin.locked ? 'red' : 'green'} handleLockClick={() => handleLockClick(coin.nominal)} key={coin.nominal} nominal={coin.nominal} count={coin.count} locked={coin.locked} />
			))}
		</>
	);
};