import axios from "axios";

const normalizeBackendUrl = () => {
	const envUrl = process.env.REACT_APP_BACKEND_URL;
	if (typeof window === "undefined") {
		return envUrl;
	}

	const currentHost = window.location.hostname;
	const defaultPort = process.env.REACT_APP_BACKEND_PORT || "8081";

	if (!envUrl) {
		return `${window.location.protocol}//${currentHost}:${defaultPort}`;
	}

	try {
		const parsed = new URL(envUrl);
		parsed.hostname = currentHost;
		return parsed.toString().replace(/\/$/, "");
	} catch (error) {
		return envUrl;
	}
};

const api = axios.create({
	baseURL: normalizeBackendUrl(),
	withCredentials: true,
});

export const openApi = axios.create({
	baseURL: normalizeBackendUrl()
});

export default api;
