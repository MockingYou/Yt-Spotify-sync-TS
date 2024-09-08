import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import config from "./utils/config.json";
import session from "express-session"

import AuthData from "./utils/interfaces/AuthData";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes"
import playlistRoutes from "./routes/playlistRoutes";

import cookieParser from "cookie-parser";
import mongoose, { ConnectOptions } from "mongoose";
dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
const uri = process.env.MONGO_URI as string;



const corsOptions = {
	origin: "http://localhost:5173",
	credentials: true,
};

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }as ConnectOptions);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

connectDB();
app.disable("x-powered-by");

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5173");
	res.header(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE",
	);
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Credentials", "true");

	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.get("/events", cors(corsOptions), (req: Request, res: Response) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});
	setInterval(() => {
		const data = { message: `Hello: (${new Date().toISOString()})` };
		console.log(`sent: ${data}`);
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	}, 1000);
});


app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", playlistRoutes)



app.listen(port, () => {
	console.log(`Server start http://localhost:${port}`);
});
