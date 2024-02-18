export class Coin {
	constructor(public nominal: number, public count: number) { }
}

export class Drink {
	constructor(public id: number, public name: string, public price: number, public count: number) { }
}

export class CoinAdminReadDto {
	constructor(public nominal: number, public count: number, public locked: boolean) { }
}

export interface DrinkCreateDto {
	name: string,
	price: number,
	count: number
}

export interface DrinkUpdateDto {
	id: number,
	price: number,
	count: number,
	rewrite: boolean
}

export interface UploadImageDto {
	id: number,
	image: File
}