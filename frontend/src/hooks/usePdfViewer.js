import { useCallback } from "react";
import { normalizeBackendAssetUrl } from "../config";

export const usePdfViewer = () => {
  const processUrl = useCallback((url) => {
    if (!url) return "";

    try {
      return normalizeBackendAssetUrl(url);
    } catch (error) {
      console.error("Erro ao processar URL do arquivo:", error);
      return url;
    }
  }, []);

  const isPdfUrl = (mediaUrl, body, mediaType) => {
    if (mediaType === "application/pdf") return true;

    if (mediaUrl) {
      const url = mediaUrl.toLowerCase();
      return (
        url.endsWith(".pdf") ||
        url.includes(".pdf?") ||
        url.includes("/pdf/")
      );
    }

    if (body) {
      return body.toLowerCase().includes(".pdf");
    }

    return false;
  };

  const validatePdfUrl = useCallback((url) => {
    if (!url || typeof url !== "string") {
      return false;
    }

    if (url.length < 5) {
      return false;
    }

    if (url.includes("undefined") || url.includes("null")) {
      return false;
    }

    return true;
  }, []);

  const triggerBrowserDownload = useCallback((resourceUrl, filename) => {
    const link = document.createElement("a");
    link.href = resourceUrl;
    link.download = filename;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadPdf = useCallback(
    async (url, filename = "documento.pdf") => {
      if (!url) {
        console.error("URL do arquivo não fornecida para download");
        return;
      }

      const processedUrl = processUrl(url);

      try {
        const response = await fetch(processedUrl);

        if (!response.ok) {
          throw new Error(`Falha HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        try {
          triggerBrowserDownload(blobUrl, filename);
        } finally {
          window.URL.revokeObjectURL(blobUrl);
        }
      } catch (error) {
        console.error("Erro ao baixar arquivo:", error);
        try {
          triggerBrowserDownload(processedUrl, filename);
        } catch (fallbackError) {
          console.error("Erro no fallback do download:", fallbackError);
          window.open(processedUrl, "_blank", "noopener,noreferrer");
        }
      }
    },
    [processUrl, triggerBrowserDownload]
  );

  const extractPdfInfoFromMessage = useCallback(
    (message) => {
      const info = {
        url: processUrl(message.mediaUrl || ""),
        filename: "documento.pdf",
        size: message.fileSize || null,
        mediaType: message.mediaType || "",
        isPdf: false,
      };

      if (message.body && typeof message.body === "string") {
        const body = message.body.trim();
        if (body.length < 100 && body.includes(".")) {
          info.filename = body;
        }
      }

      if (info.filename === "documento.pdf" && info.url) {
        try {
          const urlParts = info.url.split("/");
          const urlFilename = urlParts[urlParts.length - 1];
          const cleanFilename = urlFilename.split("?")[0];
          const decodedFilename = decodeURIComponent(cleanFilename);

          if (decodedFilename && decodedFilename.includes(".")) {
            info.filename = decodedFilename;
          }
        } catch (error) {
          console.warn("Erro ao extrair nome do arquivo:", error);
        }
      }

      info.isPdf = isPdfUrl(info.url, info.filename, info.mediaType);

      return info;
    },
    [processUrl]
  );

  return {
    downloadPdf,
    isPdfUrl,
    validatePdfUrl,
    extractPdfInfoFromMessage,
    processUrl,
  };
};
