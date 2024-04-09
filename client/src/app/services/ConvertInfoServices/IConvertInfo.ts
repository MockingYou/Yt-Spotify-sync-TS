
type Direction = { 
	index: Number,
	link: String,
	name: String,
	token: String
}

export default interface IConvertInfo {
	icon: any;
	isSource?: boolean;
	isDestination?: boolean;
	direction?: Direction;
	handleButtonClick?: Function;
}