import { Fragment, useEffect } from "react";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";
import SelectorButton from "../components/SelectorButton";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const popupWidth = 600;
const popupHeight = 900;

// Function to calculate popup position
const calculatePopupPosition = () => {
  const left = window.screenX + (window.outerWidth - popupWidth) / 2;
  const top = window.screenY + (window.outerHeight - popupHeight) / 2;
  return { left, top };
};

const SourceSelector = ({ source, destination, setSource, setDestination }) => {
  const navigate = useNavigate();

  // Effect to save source and destination to localStorage
  useEffect(() => {
    localStorage.setItem("source", JSON.stringify(source));
    localStorage.setItem("destination", JSON.stringify(destination));
  }, [source, destination]);

  const handleButtonClick = (
    index: number,
    token: string,
    providerUrl: string,
    providerName: string,
  ) => {
    try {
      if (!Cookies.get(token)) {
        const { left, top } = calculatePopupPosition(); // Calculate popup position
        const popup = window.open(
          providerUrl,
          "_blank",
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
        );
        const messageHandler = (event) => {
          const { data } = event;
          if (data.success) {
            popup?.close();
            window.removeEventListener("message", messageHandler);
            Cookies.set(`${providerName}Token`, data.token, {
              expires: 1 / 24,
            });
            navigate("/playlistselector");
          }
        };
        window.addEventListener("message", messageHandler);
      }
    } catch (error) {
      console.error(`Error during ${providerName} login:`, error);
    }
  
    if (source.index === null) {
      setSource({ index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName });
    } else if (destination === null && index !== source.index) {
      setDestination({ index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName });
    } else {
      setSource({});
      setDestination({});
    }
  };

  const buttonData = [
    {
      name: "spotify",
      icon: faSpotify,
      handleButtonClick: () =>
        handleButtonClick(
          0,
          "spotifyToken",
          "http://localhost:8000/spotify/login",
          "spotify"
        ),
      isSource: source.index === 0,
      isDestination: destination.index === 0,
    },
    {
      name: "youtube",
      icon: faYoutube,
      handleButtonClick: () =>
        handleButtonClick(
          1,
          "youtubeToken",
          "http://localhost:8000/google/login",
          "youtube"
        ),
      isSource: source.index === 1,
      isDestination: destination.index === 1,
    },
  ];

  return (
    <Fragment>
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
        <h1>Step 1</h1>
        <p className="text-center text-white">
          Select a{" "}
          {source.index !== null && destination.index !== null ? "Destination" : "Source"}:
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center bg-gray-900">
          {buttonData.map((data) => (
            <SelectorButton
              key={data.name}
              name={data.name}
              icon={data.icon}
              handleLogin={data.handleButtonClick}
              isSource={data.isSource}
              isDestination={data.isDestination}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default SourceSelector;
