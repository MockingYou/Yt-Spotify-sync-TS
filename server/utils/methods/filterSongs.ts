import Song from "../interfaces/songs/Song";

const checkFullName = (details: any): Song => {
	let song: Song = {
		artist: "",
		track: "",
	};
	if (details.title.includes("-")) {
		let newTrack = details.title.split("-");
		song = { artist: newTrack[0].trim(), track: newTrack[1].trim() };
	} else {
		song = {
			artist: details.channelTitle,
			track: details.title,
		};
		if (song.artist.includes(" - Topic")) {
			song.artist = song.artist.replace(/\s*-\s*Topic$/, "");
		}
	}
	return song;
};

const normalizeString = (str: string): string => {
	return str
		.replace(
			/\sfeat(?:\.|uring)?[\s\S]*$|[\s\S]*\sremix$|\slyrics$|\smusic\s*video$/gi,
			"",
		)
		.trim();
};

export { checkFullName, normalizeString };