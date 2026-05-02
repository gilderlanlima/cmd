function getConfig(name, defaultValue = null) {
    // If inside a docker container, use window.ENV
    if (window.ENV !== undefined) {
        return window.ENV[name] || defaultValue;
    }

    return process.env[name] || defaultValue;
}

function isLocalHostName(hostName) {
    return hostName === "localhost" || hostName === "127.0.0.1" || hostName === "::1";
}

function getRemoteBackendUrl(protocol, hostname, fallbackPort) {
    if (hostname === "app.ideianobolso.com" || hostname === "www.app.ideianobolso.com") {
        return "https://app-bk.ideianobolso.com";
    }

    if (hostname === "painel.ideianobolso.com" || hostname === "www.painel.ideianobolso.com") {
        return "https://painel.ideianobolso.com/api-proxy";
    }

    return `${protocol}//${hostname}:${fallbackPort}`;
}

export function getBackendUrl() {
    const configuredUrl = getConfig("REACT_APP_BACKEND_URL");
    const fallbackPort = getConfig("PROXY_PORT", "8081");

    if (typeof window !== "undefined") {
        const { protocol, hostname } = window.location;
        const appIsLocal = isLocalHostName(hostname);

        if (configuredUrl) {
            try {
                const parsedUrl = new URL(configuredUrl);
                const configuredIsLocal = isLocalHostName(parsedUrl.hostname);

                if (!appIsLocal && configuredIsLocal) {
                    const port = parsedUrl.port || fallbackPort;
                    return getRemoteBackendUrl(protocol, hostname, port);
                }

                return configuredUrl;
            } catch (error) {
                console.warn("[config] URL do backend inválida. Aplicando fallback dinâmico.");
            }
        }

        return getRemoteBackendUrl(protocol, hostname, fallbackPort);
    }

    return configuredUrl || `http://localhost:${fallbackPort}`;
}

export function normalizeBackendAssetUrl(url, options = {}) {
    if (!url || typeof url !== "string") {
        return "";
    }

    const backendUrl = getBackendUrl().replace(/\/$/, "");
    const ensurePublic = options.ensurePublic !== false;

    try {
        if (/^https?:\/\//i.test(url)) {
            const parsedUrl = new URL(url);
            const backendParsedUrl = new URL(backendUrl);
            const pathIsPublic = parsedUrl.pathname.startsWith("/public/");
            const parsedIsLocal = isLocalHostName(parsedUrl.hostname);

            if (
                pathIsPublic &&
                (
                    parsedIsLocal ||
                    (typeof window !== "undefined" && parsedUrl.origin === window.location.origin)
                )
            ) {
                return `${backendParsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
            }

            return url;
        }
    } catch (error) {
        console.warn("[config] URL de asset inválida. Aplicando fallback dinâmico.");
    }

    if (url.startsWith("/public/")) {
        return `${backendUrl}${url}`;
    }

    const normalizedPath = url.replace(/^\/+/, "");

    if (!ensurePublic || normalizedPath.startsWith("public/")) {
        return `${backendUrl}/${normalizedPath}`;
    }

    return `${backendUrl}/public/${normalizedPath}`;
}

export function withCacheBustedUrl(url, seed = "") {
    if (!url || typeof url !== "string") {
        return "";
    }

    const normalizedSeed = seed || Date.now().toString();
    const separator = url.includes("?") ? "&" : "?";

    return `${url}${separator}v=${encodeURIComponent(normalizedSeed)}`;
}

export function getHoursCloseTicketsAuto() {
    return getConfig('REACT_APP_HOURS_CLOSE_TICKETS_AUTO');
}

export function getFrontendPort() {
    return getConfig('SERVER_PORT');
}

export function getPrimaryColor() {
    return getConfig("REACT_APP_PRIMARY_COLOR");
}

export function getPrimaryDark() {
    return getConfig("REACT_APP_PRIMARY_DARK");
}

export function getNumberSupport() {
    return getConfig("REACT_APP_NUMBER_SUPPORT");
}
