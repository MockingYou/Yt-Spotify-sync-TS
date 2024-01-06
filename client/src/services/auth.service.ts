import axios from "axios";

const API_URL = "http://localhost:8000/";

// const register = (username: string, email: string, source: string) => {
//   return axios.post(`${API_URL}${source}/login`, {
//     username,
//     email,
//   });
// };

const login = async (source: string) => {
  return await axios
    .get(`${API_URL}${source}/login`)
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem(`user${source}`, JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

export default {
  login,
  logout,
};
