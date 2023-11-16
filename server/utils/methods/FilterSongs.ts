import Song from "../songs/Song";

const checkFullName = (details: any): Song => {
  let song: Song = {
    artist: "",
    track: "",
  };
  if (details.videoDetails.title.includes("-")) {
    let newTrack = details.videoDetails.title.split("-");
    song = { artist: newTrack[0].trim(), track: newTrack[1].trim() };
  } else {
    song = {
      artist: details.videoDetails.author.name,
      track: details.videoDetails.title,
    };
    if (song.artist.includes(" - Topic")) {
      song.artist = song.artist.replace(/\s*-\s*Topic$/, "");
    }
  }
  return song;
};

const normalizeString = (str: string): string => {
  return str
    .replace(/[^\w\s]/gi, "")
    .replace(
      /\sfeat(?:\.|uring)?[\s\S]*$|[\s\S]*\sremix$|\slyrics$|\smusic\s*video$/gi,
      ""
    )
    .toLowerCase()
    .trim();
};

export { checkFullName, normalizeString };
