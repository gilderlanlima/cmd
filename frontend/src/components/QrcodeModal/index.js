import React, { useContext, useEffect, useState } from "react";
import QRCode from "qrcode.react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: "min(920px, calc(100vw - 32px))",
    maxWidth: "unset",
    borderRadius: 28,
    overflow: "hidden",
  },
  content: {
    padding: 0,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    minHeight: 520,
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  sidebar: {
    position: "relative",
    padding: theme.spacing(5),
    background: "linear-gradient(165deg, #0f172a 0%, #1d4ed8 100%)",
    color: "#fff",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    color: "#fff",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 800,
    fontSize: "2.25rem",
    lineHeight: 1.05,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.8rem",
    },
  },
  description: {
    color: "rgba(255,255,255,0.86)",
    fontSize: "1rem",
    lineHeight: 1.7,
    marginBottom: theme.spacing(3),
  },
  stepCard: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: theme.spacing(2.25),
    marginBottom: theme.spacing(2),
  },
  stepTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(0.75),
  },
  channelCaption: {
    marginTop: theme.spacing(2.5),
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.92)",
  },
  qrPane: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    background: "linear-gradient(180deg, #eef4ff 0%, #ffffff 100%)",
  },
  qrCard: {
    width: "100%",
    maxWidth: 360,
    padding: theme.spacing(4),
    borderRadius: 28,
    textAlign: "center",
    boxShadow: "0 24px 50px rgba(15, 23, 42, 0.12)",
  },
  qrTitle: {
    fontWeight: 800,
    marginBottom: theme.spacing(1),
  },
  qrDescription: {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
    marginBottom: theme.spacing(3),
  },
  qrBox: {
    padding: theme.spacing(2),
    borderRadius: 24,
    border: "1px solid #dbeafe",
    backgroundColor: "#fff",
    display: "inline-flex",
  },
  qrFallback: {
    color: theme.palette.text.secondary,
    minHeight: 280,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerHint: {
    marginTop: theme.spacing(3),
    color: "#4b5563",
    lineHeight: 1.6,
  },
}));

const connectionSteps = [
  {
    title: "1. Abra o WhatsApp no celular",
    description:
      "Entre no menu do aplicativo e acesse a área de dispositivos conectados.",
  },
  {
    title: "2. Escolha vincular um dispositivo",
    description:
      "Aponte a câmera para o QR Code exibido nesta tela e aguarde a validação.",
  },
  {
    title: "3. Pronto para atender",
    description:
      "Assim que o QR desaparecer, a conexão estará ativa e disponível no painel.",
  },
];

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [qrCode, setQrCode] = useState("");
  const [whatsAppName, setWhatsAppName] = useState("");
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode || "");
        setWhatsAppName(data.name || "");
      } catch (err) {
        toastError(err);
      }
    };

    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = user.companyId;

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode || "");
        setWhatsAppName(data.session.name || "");
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    };

    socket.on(`company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      socket.off(`company-${companyId}-whatsappSession`, onWhatsappData);
    };
  }, [whatsAppId, onClose, socket, user.companyId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      aria-labelledby="qr-code-dialog"
    >
      <DialogContent className={classes.content}>
        <div className={classes.layout}>
          <div className={classes.sidebar}>
            <IconButton className={classes.closeButton} onClick={onClose}>
              <Close />
            </IconButton>
            <span className={classes.badge}>CRM Ideia no Bolso</span>
            <Typography className={classes.title}>
              Conecte seu WhatsApp em segundos
            </Typography>
            <Typography className={classes.description}>
              Escaneie o QR Code com o celular para iniciar a sessão e liberar o atendimento desta conexão.
            </Typography>

            {connectionSteps.map((step) => (
              <div key={step.title} className={classes.stepCard}>
                <Typography className={classes.stepTitle}>{step.title}</Typography>
                <Typography variant="body2">{step.description}</Typography>
              </div>
            ))}

            <Typography className={classes.channelCaption}>
              Conexão: <strong>{whatsAppName || "WhatsApp"}</strong>
            </Typography>
          </div>

          <div className={classes.qrPane}>
            <Paper elevation={0} className={classes.qrCard}>
              <Typography variant="h4" className={classes.qrTitle}>
                Leia o QR Code
              </Typography>
              <Typography variant="body1" className={classes.qrDescription}>
                Mantenha esta tela aberta enquanto faz a leitura pelo celular.
              </Typography>

              {qrCode ? (
                <div className={classes.qrBox}>
                  <QRCode
                    value={qrCode}
                    size={240}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              ) : (
                <div className={classes.qrFallback}>
                  <Typography variant="body1">
                    Gerando o QR Code da sessão. Aguarde alguns instantes...
                  </Typography>
                </div>
              )}

              <Typography variant="body2" className={classes.footerHint}>
                Se o código expirar, gere um novo QR na tela de conexões.
              </Typography>
            </Paper>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
