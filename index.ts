import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import ytdl from "ytdl-core";
import { checkFullName, normalizeString } from "./utils/songs/filterSongs";
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get("/", async (req: Request, res: Response) => {
  const video_url = "https://www.youtube.com/watch?v=8tcpdbwACPw";
  const details = await ytdl.getBasicInfo(video_url);
  const song = checkFullName(details);
  res.send(song);
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
