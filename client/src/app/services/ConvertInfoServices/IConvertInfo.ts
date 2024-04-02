
type Direction = { 
	index: Number,
	link: String,
	name: String,
}

export default interface IConvertInfo {
	handleButtonClick: () => void;
	icon: any;
	isSource: boolean;
	isDestination: boolean;
	source?: Direction;
	destination?: Direction;
}