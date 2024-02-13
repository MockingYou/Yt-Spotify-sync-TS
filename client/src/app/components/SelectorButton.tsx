import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SelectorButton = ({ handleLogin, name, icon, isSource, isDestination }) => {
  return (
    <button
      onClick={handleLogin}
      className={`rounded-3xl bg-gray-800 px-3 py-2 text-sm font-mono font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 m-5 w-48 h-48 ${
        isSource || isDestination ? "" : "disabled"
      }`}
      disabled={isSource || isDestination}
    >
      <div className="text-2xl">
        <p>
          <FontAwesomeIcon icon={icon} size="lg" /> {name}
        </p>
        {/* Render source or destination text */}
        {isSource && <span className="text-xs text-gray-400">Source</span>}
        {isDestination && <span className="text-xs text-gray-400">Destination</span>}
      </div>
    </button>
  );
};

export default SelectorButton;
