const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const normalizeBaseUrl = (rawUrl?: string): string => {
  const fallback = "http://localhost:8080";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");

  try {
    const parsed = new URL(value);
    const proxyPort = (process.env.PROXY_PORT || "").trim();
    const hasExplicitPort = Boolean(parsed.port);

    if (!proxyPort || hasExplicitPort || !LOCAL_HOSTS.has(parsed.hostname)) {
      return parsed.origin;
    }

    return `${parsed.protocol}//${parsed.hostname}:${proxyPort}`;
  } catch (error) {
    return value;
  }
};

export const getBackendBaseUrl = (): string => {
  return normalizeBaseUrl(process.env.BACKEND_URL);
};

export const buildCompanyPublicUrl = (
  companyId: number | string,
  mediaPath: string
): string => {
  const sanitizedPath = String(mediaPath || "").replace(/^\/+/, "");
  return `${getBackendBaseUrl()}/public/company${companyId}/${sanitizedPath}`;
};

export const buildPublicUrl = (mediaPath: string): string => {
  const sanitizedPath = String(mediaPath || "").replace(/^\/+/, "");
  return `${getBackendBaseUrl()}/public/${sanitizedPath}`;
};
