import React from "react";
import { Facebook, Instagram, Public, WhatsApp } from "@material-ui/icons";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

const baseIconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "-3px",
};

const buildMuiIcon = (IconComponent, color) => ({
  color,
  render: ({ style = {}, fontSize = "small", className } = {}) => (
    <IconComponent
      fontSize={fontSize}
      className={className}
      style={{ ...baseIconStyle, color, ...style }}
    />
  ),
});

const buildReactIcon = (IconComponent, color) => ({
  color,
  render: ({ style = {}, size = 16, className } = {}) => (
    <IconComponent
      className={className}
      size={size}
      style={{ ...baseIconStyle, color, ...style }}
    />
  ),
});

export const CHANNEL_CATALOG = {
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Canal principal com QR Code para atendimento em tempo real.",
    ...buildMuiIcon(WhatsApp, "#25D366"),
  },
  whatsapp_oficial: {
    key: "whatsapp_oficial",
    label: "WhatsApp API Cloud",
    description: "Integração oficial com a Meta para operação escalável.",
    ...buildMuiIcon(WhatsApp, "#128C7E"),
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    description: "Atendimentos originados por DM do Instagram.",
    ...buildMuiIcon(Instagram, "#E1306C"),
  },
  facebook: {
    key: "facebook",
    label: "Facebook",
    description: "Mensagens recebidas pelo Facebook Messenger.",
    ...buildMuiIcon(Facebook, "#1877F2"),
  },
  telegram: {
    key: "telegram",
    label: "Telegram",
    description: "Canal para bots e atendimento operacional no Telegram.",
    ...buildReactIcon(FaTelegramPlane, "#27A7E7"),
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    description: "Atendimento vindo do TikTok com identidade visual dedicada.",
    ...buildReactIcon(SiTiktok, "#111827"),
  },
  webchat: {
    key: "webchat",
    label: "Web Chat",
    description: "Canal de chat online para site, landing page e portal.",
    ...buildReactIcon(BsChatSquareDotsFill, "#4F46E5"),
  },
  external: {
    key: "external",
    label: "Canal Externo",
    description: "Integração externa configurada manualmente.",
    ...buildMuiIcon(Public, "#64748B"),
  },
};

export const getChannelMeta = (channel) =>
  CHANNEL_CATALOG[channel] || CHANNEL_CATALOG.external;
