import axios from "axios";

export const handleLogin = async (
  url: string,
  setLoggedIn: Function,
  event: any,
) => {
  const popupWidth: number = 600;
  const popupHeight: number = 900;
  const left: number = window.screenX + (window.outerWidth - popupWidth) / 2;
  const top: number = window.screenY + (window.outerHeight - popupHeight) / 2;
  try {
    const popup = window.open(
      url,
      "_blank",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );
    const messageHandler = () => {
      if (event.data == "Success! You can now close the window.") {
        setLoggedIn(true);
        popup?.close();
        window.removeEventListener("message", messageHandler);
      }
    };
    window.addEventListener("message", messageHandler);
  } catch (error) {
    console.error("Error during Spotify login:", error);
  }
};

export const clampToRange = (value: number, min: number, max: number) => {
  const clampValue = Math.max(min, Math.min(value, max));
  const mappedValue = ((clampValue - min) / max - min) * 100;
  return mappedValue;
};

export const getPlaylist = async (url: string, setPalylist: Function) => {
  try {
    const playlistData = await axios.get(url);
    setPalylist(playlistData.data);
    console.log(playlistData.data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
};

