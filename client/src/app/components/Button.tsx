const Button = ({method, name}) => {
	return (
		<button onClick={method} className="bg-purple-500 hover:bg-yello-600 text-gray-800 font-mono font-bold py-2 px-4 rounded m-2">
			{name}
		</button>
	);
};

export default Button;