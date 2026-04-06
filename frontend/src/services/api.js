import axios from "axios";
import { getBackendUrl } from "../config";

const backendUrl = getBackendUrl();

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export const openApi = axios.create({
  baseURL: backendUrl,
});

export default api;
