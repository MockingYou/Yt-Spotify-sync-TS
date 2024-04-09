import { calculatePopupPosition } from "../../HelperFunctions/helperFunction";
import IConvertInfo from "./IConvertInfo";
import Cookies from "js-cookie";

const popupWidth = 600;
const popupHeight = 900;

export default class ConvertInfo implements IConvertInfo {
    public icon: any;
    public isSource?: boolean;
    public isDestination?: boolean;
    public direction?: { index: Number; link: String; name: String; token: String};

    public get convertInfoObject(): IConvertInfo {
        return {
            icon: this.icon,
            isSource: this.isSource,
            isDestination: this.isDestination,
            direction: this.direction,
        };
    }

    public set convertInfoObject(value: IConvertInfo) {
        this.icon = value.icon;
        this.isSource = value.isSource;
        this.isDestination = value.isDestination;
        this.direction = value.direction;
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
				this.direction.index !== null ? navigate("/summary") : navigate("/playlistselector");
			  }
			};
			window.addEventListener("message", messageHandler);
		  }
		} catch (error) {
		  console.error(`Error during ${providerName} login:`, error);
		}
	  
		if (this.direction.index === null) {
		  this.direction = { index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName, token };
		} else if (this.direction === null && index !== this.direction.index) {
		  this.direction = { index, link: `http://localhost:8000/api/${providerName}/get-length/`, name: providerName, token };
		} else {
			this.direction = { index: null, link: "", name: "", token: "" };
		}
	  };
}