import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { useEffect } from "react";
import { login } from "../../redux/authSlice";
import s from "./adminPage.module.css";
import { DrinksTable } from "./drinksTable";
import { getDrinks } from "../../redux/adminSlice";

export const AdminPage = () => {

	const [searchParams, setSearchParams] = useSearchParams();
	const authKey = searchParams.get("key");

	const dispatch = useDispatch<AppDispatch>();
	dispatch(getDrinks());
	const isAuthed = useSelector((state: RootState) => state.auth.authenticated);

	useEffect(() => {
		if (authKey != null)
			dispatch(login(authKey));
	})

	if (!isAuthed)
		return <h1>Authentication Failed</h1>

	return (
		<>
			<div className={s.CashBlock}>
				<h1>CashBlock</h1>
			</div>
			<div className={s.DrinksBlock}>
				<DrinksTable />
			</div>
		</>
	);
}