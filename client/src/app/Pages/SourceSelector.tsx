import { Fragment, Key, useEffect } from "react";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";
import SelectorButton from "../components/SelectorButton";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import IConvertInfo from "../services/ConvertInfoServices/IConvertInfo";
import { calculatePopupPosition } from "../HelperFunctions/helperFunction";

const popupWidth = 600;
const popupHeight = 900;

const SourceSelector = ({ source, destination, setSource, setDestination }) => {
  const navigate = useNavigate();

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
        const { left, top } = calculatePopupPosition();
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
            source.index !== null ? navigate("/summary") : navigate("/playlistselector");
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

  const buttonData: IConvertInfo[] = [
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
        <h1>Step { source.index !== null ? 3 : 1 }</h1>
        <p className="text-center text-white">
          Select a{" "}
          {source.index !== null  ? "Destination" : "Source"}:
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center bg-gray-900">
          {buttonData.map((data) => (
            <SelectorButton
              key={data.name as Key}
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
