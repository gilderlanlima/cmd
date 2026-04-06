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
                    return `${protocol}//${hostname}:${port}`;
                }

                return configuredUrl;
            } catch (error) {
                console.warn("[config] URL do backend inválida. Aplicando fallback dinâmico.");
            }
        }

        return `${protocol}//${hostname}:${fallbackPort}`;
    }

    return configuredUrl || `http://localhost:${fallbackPort}`;
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
