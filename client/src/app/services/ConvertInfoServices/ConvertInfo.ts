import IConvertInfo from "./IConvertInfo";
import Cookies from "js-cookie";
import { calculatePopupPosition } from "../../HelperFunctions/helperFunction";
const popupWidth = 600;
const popupHeight = 900;

export default class ConvertInfo {
	private convertInfo: IConvertInfo;
	constructor() {
		this.convertInfo = {
			handleButtonClick: () => {},
			icon: "",
			isSource: false,
			isDestination: false,
			source: {
				index: null,
				link: "",
				name: "",
			},
			destination: {
				index: null,
				link: "",
				name: "",
			},
		}
	}
	public handleButtonClick = (
		index: number,
		token: string,
		providerUrl: string,
		providerName: string,
		navigate: Function
	  ) => {
		try {
		  if (!Cookies.get(token)) {
			const { left, top } = calculatePopupPosition(popupWidth, popupHeight);
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
				this.convertInfo.source.index !== null ? navigate("/summary") : navigate("/playlistselector");
			  }
			};
			window.addEventListener("message", messageHandler);
		  }
		} catch (error) {
		  console.error(`Error during ${providerName} login:`, error);
		}
	  
		if (this.convertInfo.source.index === null) {
			this.convertInfo.source = { index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName }
		//   setSource({ index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName });
		} else if (this.convertInfo.destination === null && index !== this.convertInfo.source.index) {
			this.convertInfo.destination = { index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName }
		//   setDestination({ index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName });
		} else {
			this.convertInfo.source = {
				index: null,
				link: "",
				name: ""
			}
			this.convertInfo.destination = {
				index: null,
				link: "",
				name: ""
			} 
		//   setSource({});
		//   setDestination({});
		}
	  };
}