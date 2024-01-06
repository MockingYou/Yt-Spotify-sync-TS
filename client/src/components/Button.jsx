const Button = (props) => {
	return (
		<button onClick={() => props.onClickHandle} className="bg-purple-500 hover:bg-yellow-600 text-gray-800 font-ubuntu font-bold py-2 px-4 rounded m-2">
			{props.name}
		</button>
	);
};

export default Button;