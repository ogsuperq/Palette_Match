import axios from "axios";

const backendUrl = (process.env.REACT_APP_BACKEND_URL || window.location.origin).replace(/\/$/, "");
export const API = `${backendUrl}/api`;

export const http = axios.create({
  baseURL: API,
  withCredentials: true,
});
