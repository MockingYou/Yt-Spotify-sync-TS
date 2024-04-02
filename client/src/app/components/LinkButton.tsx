import { Link } from "react-router-dom";

const LinkButton = ({name, link}) => {
	return (
		<>
			<Link to={link} className="bg-purple-500 hover:bg-yello-600 text-gray-800 font-mono font-bold py-2 px-4 rounded m-2">
				{name}
			</Link>
		</>
	);
};

export default LinkButton;