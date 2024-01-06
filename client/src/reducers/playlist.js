import { GET_PLAYLISTS, GET_LENGTH, GET_SONGS } from "../actions/types";


const initialState = {};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PLAYLISTS:
      return { message: payload };

    case CLEAR_MESSAGE:
      return { message: "" };

    default:
      return state;
  }
}
