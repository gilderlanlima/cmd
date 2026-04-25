export const flowNodePalettes = {
  start: {
    accent: "#42b855",
    soft: "#f4fff6",
    border: "rgba(66, 184, 85, 0.28)",
    iconBg: "rgba(66, 184, 85, 0.12)",
    handle: "#ef4444",
  },
  content: {
    accent: "#ef5a5a",
    soft: "#fff7f7",
    border: "rgba(239, 90, 90, 0.24)",
    iconBg: "rgba(239, 90, 90, 0.12)",
    handle: "#1d4ed8",
  },
  menu: {
    accent: "#7c5ce0",
    soft: "#faf7ff",
    border: "rgba(124, 92, 224, 0.24)",
    iconBg: "rgba(124, 92, 224, 0.12)",
    handle: "#1d4ed8",
  },
  queue: {
    accent: "#ef5ad7",
    soft: "#fff7fe",
    border: "rgba(239, 90, 215, 0.24)",
    iconBg: "rgba(239, 90, 215, 0.12)",
    handle: "#111827",
  },
};

export const getNodeShellStyle = (palette, extra = {}) => ({
  position: "relative",
  minWidth: 178,
  maxWidth: 206,
  padding: "10px 12px 12px",
  borderRadius: "12px",
  border: `1px solid ${palette.border}`,
  background: "#ffffff",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  ...extra,
});

export const getNodeHeaderStyle = () => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
});

export const getNodeTitleGroupStyle = () => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
});

export const getNodeIconWrapStyle = (palette) => ({
  width: 18,
  height: 18,
  minWidth: 18,
  borderRadius: 4,
  background: palette.iconBg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: palette.accent,
});

export const getNodeTitleStyle = () => ({
  color: "#202636",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: "0.01em",
});

export const getNodeActionsStyle = () => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#c1c7d6",
  cursor: "pointer",
});

export const getNodeActionIconStyle = (palette) => ({
  width: 13,
  height: 13,
  color: palette.accent,
  opacity: 0.9,
});

export const getNodeBodyStyle = () => ({
  display: "flex",
  flexDirection: "column",
  gap: 7,
});

export const getNodePreviewStyle = (palette, extra = {}) => ({
  background: palette.soft,
  border: `1px solid ${palette.border}`,
  borderRadius: 10,
  padding: "10px 11px",
  minHeight: 54,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  ...extra,
});

export const getNodePreviewCenterStyle = () => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 6,
});

export const getNodePreviewTextStyle = (clamp = 2) => ({
  color: "#444d5f",
  fontSize: 10,
  lineHeight: 1.4,
  textAlign: "center",
  wordBreak: "break-word",
  display: "-webkit-box",
  WebkitLineClamp: clamp,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export const getNodeOptionRowStyle = () => ({
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  minHeight: 24,
  paddingRight: 18,
});

export const getNodeOptionTextStyle = () => ({
  color: "#4a5262",
  fontSize: 10,
  lineHeight: 1.35,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const getHandleStyle = (color, position) => {
  const isSource = position === "source";

  return {
    background: color,
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid #ffffff",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.16)",
    top: 18,
    cursor: "pointer",
    [isSource ? "right" : "left"]: -11,
  };
};

export const getHandleArrowStyle = () => ({
  color: "#ffffff",
  width: 10,
  height: 10,
  marginLeft: 3,
  marginBottom: 1,
  pointerEvents: "none",
});
