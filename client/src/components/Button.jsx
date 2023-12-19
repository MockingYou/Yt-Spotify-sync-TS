const Button = (props) => {
	return (
		<button onClick={props.method} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">
			{props.name}
		</button>
	);
};

export default Button;