import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const apiClient = axios.create({
  baseURL: apiUrl,
});

export default apiClient;
