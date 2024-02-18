import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { useEffect } from "react";
import { login } from "../../redux/authSlice";
import s from "./adminPage.module.css";
import { DrinksTable } from "./drinksTable";
import { getCash, getDrinks, updateCash } from "../../redux/adminSlice";
import { CashBlock } from "./cashBlock";

export const AdminPage = () => {

	const [searchParams, setSearchParams] = useSearchParams();
	const authKey = searchParams.get("key");

	const changes = useSelector((state: RootState) => state.admin.cashChanges);

	const dispatch = useDispatch<AppDispatch>();

	dispatch(getDrinks());
	dispatch(getCash());

	const isAuthed = useSelector((state: RootState) => state.auth.authenticated);

	useEffect(() => {
		if (authKey != null)
			dispatch(login(authKey));
	})

	const handleCashSave = () => {
		console.log(changes);
		dispatch(updateCash(changes));
	}

	if (!isAuthed)
		return <h1>Authentication Failed</h1>

	return (
		<>
			<div className={s.CashBlock}>
				<CashBlock />
				<button onClick={handleCashSave}>Save</button>
			</div>
			<div className={s.DrinksBlock}>
				<DrinksTable />
			</div>
		</>
	);
}