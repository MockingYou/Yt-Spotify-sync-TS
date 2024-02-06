const Button = (props) => {
	return (
		<button onClick={props.method} className="bg-purple-500 hover:bg-yello-600 text-gray-800 font-mono font-bold py-2 px-4 rounded m-2">
			{props.name}
		</button>
	);
};

export default Button;