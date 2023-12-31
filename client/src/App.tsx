import NavBar from "./components/NavBar";
import NotFound from "./Pages/NotFound";
import Home from "./Pages/Home";
import Selector from "./Pages/Selector";
import SourceControl from "./Pages/SourceControl";

import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
	return (
		<>
			<BrowserRouter>
				<NavBar />
				<Routes>
					<Route element={<NotFound />} path="/*" />
					<Route element={<Home />} path="/" />
					<Route element={<Home />} path="/home" />
					<Route element={<Selector />} path="/selector" />
					<Route element={<SourceControl />} path="/sourcecontrol" />

				</Routes>
			</BrowserRouter>
		</>
	);
}
