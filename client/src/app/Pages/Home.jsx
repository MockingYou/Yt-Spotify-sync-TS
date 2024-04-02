import React, { Fragment, useEffect } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Home({source, destination, setSource, setDestination}) {
    useEffect(() => {
        localStorage.removeItem("source");
        localStorage.removeItem("destination");
        Cookies.remove("spotifyToken")
        Cookies.remove("youtubeToken")
        setSource({
            index: null,
            link: "",
            name: ""
        })
        setDestination({
            index: null,
            link: "",
            name: ""
        })
    }, [])
    return (
        <Fragment>
            <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="text-center">
                    <h1 className="mt-4 text-3xl font-mono font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Playlist Converter{" "}
                    </h1>
                    <p className="mt-6 text-base leading-7 text-gray-600">
                        Transfer your music library from Spotify to Youtube!
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            to="/sourceselector"
                            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-mono font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </main>
        </Fragment>
    );
}
