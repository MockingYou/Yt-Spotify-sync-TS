import IPlaylist from "./IPlaylist";

export default class PlaylistData implements IPlaylist {
    linkItem: string;
    playlist: Array<object>;
    
    constructor(playlist: Array<object>, linkItem: string) {
        this.playlist = playlist;
        this.linkItem = linkItem;
    }
} 