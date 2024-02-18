import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { createDrink, deleteDrink, getDrinks, updateDrink, uploadDrink, uploadImage } from '../../redux/adminSlice';
import { addDrink } from '../../redux/adminSlice';
import { Drink, DrinkCreateDto, DrinkUpdateDto } from '../../types';

class DrinkTableRow {
	constructor(public id: number, public drink: Drink,) { }
}

export const DrinksTable: React.FC = () => {

	const dispatch = useDispatch<AppDispatch>();
	const drinks = useSelector((state: RootState) => state.admin.drinks);
	let drinksRow = new Array<DrinkTableRow>();

	const [editingRowId, setEditingRowId] = useState<number | null>(null);

	const updateRows = () => {
		let counter = 0;

		drinks.forEach(element => {
			drinksRow.push(new DrinkTableRow(counter, element));
			counter++;
		});
	}

	updateRows();

	const handleAddRow = () => {
		const newId = drinksRow.length > 0 ? drinksRow[drinksRow.length - 1].id + 1 : 1;
		const newDrink = new Drink(0, '', 0, 0);

		drinksRow.push(new DrinkTableRow(newId, newDrink))

		dispatch(addDrink(newDrink));
		setEditingRowId(newId);
	};

	const handleEditRow = (id: number) => {
		setEditingRowId(id);
	};

	const handleSaveRow = (id: number, row: DrinkTableRow) => {
		if (row.drink.id === 0) {
			const drinkCreateDto: DrinkCreateDto = { name: row.drink.name, price: row.drink.price, count: row.drink.count }
			dispatch(createDrink(drinkCreateDto));
		}
		else {
			const drinkUpdateDto: DrinkUpdateDto = { id: row.drink.id, price: row.drink.price, count: row.drink.count, rewrite: true }
			dispatch(uploadDrink(drinkUpdateDto));
		}
		setEditingRowId(null);
	};

	const handleDeleteRow = (id: number) => {
		dispatch(deleteDrink(id));
	};

	const handleInputChange = (id: number, field: string, value: string | number | File) => {
		const row = drinksRow.find(row => row.id === id);

		if (row !== undefined) {

			if (field === 'image') {
				console.log('uploading image');
				dispatch(uploadImage({ id: row.drink.id, image: value as File }));
				return;
			}

			console.log('handeling');

			const drink = new Drink(row.drink.id,
				field === 'name' ? value as string : row.drink.name,
				field === 'price' ? value as number : row.drink.price,
				field === 'count' ? value as number : row.drink.count);

			dispatch(updateDrink(drink));
		}
	};

	return (
		<div>
			<button onClick={handleAddRow}>Добавить запись</button>
			<table>
				<thead>
					<tr>
						<th>RowId</th>
						<th>ItemId</th>
						<th>Имя</th>
						<th>Цена</th>
						<th>Количество</th>
						<th>Картинка</th>
						<th>Действия</th>
					</tr>
				</thead>
				<tbody>
					{drinksRow.map((row) => (
						<tr key={row.id}>
							<td>
								{row.id}
							</td>
							<td>
								{row.drink.id}
							</td>
							<td>
								{editingRowId === row.id ? (
									<input
										type="text"
										value={row.drink.name}
										onChange={(e) => handleInputChange(row.id, 'name', e.target.value)}
									/>
								) : (
									row.drink.name
								)}
							</td>
							<td>
								{editingRowId === row.id ? (
									<input
										type="number"
										value={row.drink.price}
										onChange={(e) => handleInputChange(row.id, 'price', Number(e.target.value))}
									/>
								) : (
									row.drink.price
								)}
							</td>
							<td>
								{editingRowId === row.id ? (
									<input
										type="number"
										value={row.drink.count}
										onChange={(e) => handleInputChange(row.id, 'count', Number(e.target.value))}
									/>
								) : (
									row.drink.count
								)}
							</td>
							<td>
								{editingRowId === row.id ? (
									row.drink.id === 0 ? (<p>you can change photo after creating</p>) : (<input
										type="file"
										onChange={(e) => handleInputChange(row.id, 'image', e.target.files?.[0] || '')}
									/>)

								) : (
									<img src={`http://localhost:5136/api/wending/drinks/${row.drink.id}/img`} style={{ width: '50px', height: '50px' }} alt="Изображение" />
								)}
							</td>
							<td>
								{editingRowId === row.id ? (
									<button onClick={() => handleSaveRow(row.id, row)}>Сохранить</button>
								) : (
									<>
										<button onClick={() => handleEditRow(row.id)}>Редактировать</button>
										<button onClick={() => handleDeleteRow(row.drink.id)}>Удалить</button>
									</>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
