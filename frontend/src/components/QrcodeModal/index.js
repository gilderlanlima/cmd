import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography
} from "@material-ui/core";
import { Close, WhatsApp } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: "min(920px, 96vw)",
    maxWidth: 920,
    borderRadius: 20,
    overflow: "hidden",
    margin: 0,
    background: "#dce4f1",
    boxShadow: "0 24px 64px rgba(15, 24, 41, 0.35)",
  },
  content: {
    padding: 0,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    minHeight: 560,
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
      minHeight: "auto",
    }
  },
  leftPanel: {
    position: "relative",
    padding: theme.spacing(4, 4, 3),
    background: "linear-gradient(135deg, #0f2556 0%, #143874 48%, #1c66c9 100%)",
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    }
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    color: "#e7f0ff",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.14)",
    }
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    fontWeight: 700,
    fontSize: 20,
    marginBottom: theme.spacing(3),
  },
  badgeIcon: {
    fontSize: 21,
  },
  title: {
    fontSize: 46,
    lineHeight: 1.1,
    fontWeight: 800,
    marginBottom: theme.spacing(1.5),
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: 34,
    }
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 1.36,
    color: "rgba(245, 250, 255, 0.94)",
    marginBottom: theme.spacing(3.25),
    [theme.breakpoints.down("sm")]: {
      fontSize: 23,
    }
  },
  stepCard: {
    borderRadius: 18,
    padding: theme.spacing(2.1, 2.4),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(186, 215, 255, 0.22)",
    marginBottom: theme.spacing(1.75),
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 3,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 1.45,
    color: "rgba(231, 241, 255, 0.96)",
  },
  connectionName: {
    marginTop: theme.spacing(3),
    fontSize: 16,
    fontWeight: 700,
    color: "#d4e8ff",
  },
  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    background:
      "radial-gradient(circle at 18% 12%, #f3f7ff 0%, #e7eef9 40%, #dce4f2 100%)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2.5),
    }
  },
  qrCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 32,
    padding: theme.spacing(3.2, 2.8),
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    border: "1px solid rgba(185, 201, 227, 0.9)",
    textAlign: "center",
    boxShadow: "0 16px 40px rgba(17, 39, 76, 0.11)",
  },
  qrTitle: {
    fontSize: 40,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0f2b57",
    marginBottom: theme.spacing(1.1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 33,
    }
  },
  qrSubtitle: {
    fontSize: 25,
    lineHeight: 1.36,
    color: "#304f7a",
    marginBottom: theme.spacing(2.3),
    [theme.breakpoints.down("sm")]: {
      fontSize: 21,
    }
  },
  qrCodeContainer: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fbff",
    borderRadius: 26,
    lineHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #c8d8ef",
    minHeight: 296,
  },
  loadingWrap: {
    minHeight: 296,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    marginTop: theme.spacing(2),
    fontSize: 18,
    color: "#2a4a77",
  },
  qrHint: {
    marginTop: theme.spacing(2.1),
    fontSize: 14,
    lineHeight: 1.5,
    color: "#4a628a",
  },
}));

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [qrCode, setQrCode] = useState("");
  const [whatsappName, setWhatsappName] = useState("");
  const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchSession = async () => {
      if (!whatsAppId || !open) return;

      setIsLoadingQrCode(true);
      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);

        if (!isMounted) return;

        if (data?.name) {
          setWhatsappName(data.name);
        }

        if (data?.qrcode) {
          setQrCode(data.qrcode);
          setIsLoadingQrCode(false);
          return;
        }

        // Quando o QR ainda não existe, solicita um novo e inicia polling curto.
        await api.put(`/whatsappsession/${whatsAppId}`);

        intervalId = setInterval(async () => {
          try {
            const { data: refreshData } = await api.get(`/whatsapp/${whatsAppId}`);
            if (!isMounted) return;

            if (refreshData?.name) {
              setWhatsappName(refreshData.name);
            }

            if (refreshData?.status === "CONNECTED" || refreshData?.status === "DISCONNECTED") {
              setIsLoadingQrCode(false);
              clearInterval(intervalId);
              onClose();
              return;
            }

            if (refreshData?.qrcode) {
              setQrCode(refreshData.qrcode);
              setIsLoadingQrCode(false);
              clearInterval(intervalId);
            }
          } catch (pollErr) {
            // Falha pontual de polling não deve quebrar o modal.
          }
        }, 1500);
      } catch (err) {
        toastError(err);
        if (isMounted) {
          setIsLoadingQrCode(false);
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [whatsAppId, open]);

  useEffect(() => {
    if (!whatsAppId || !socket || typeof socket.on !== "function") return;
    const companyId = user.companyId;

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session?.id === whatsAppId) {
        if (data.session?.status === "CONNECTED" || data.session?.status === "DISCONNECTED") {
          setIsLoadingQrCode(false);
          onClose();
          return;
        }

        if (data.session?.name) {
          setWhatsappName(data.session.name);
        }
        setQrCode(data.session.qrcode);
        setIsLoadingQrCode(false);
      }
    };
    socket.on(`company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      if (typeof socket.off === "function") {
        socket.off(`company-${companyId}-whatsappSession`, onWhatsappData);
      }
    };
  }, [whatsAppId, onClose, user.companyId, socket]);

  useEffect(() => {
    if (!open) {
      setQrCode("");
      setWhatsappName("");
      setIsLoadingQrCode(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      aria-labelledby="qr-code-dialog"
    >
      <DialogContent className={classes.content}>
        <div className={classes.layout}>
          <div className={classes.leftPanel}>
            <IconButton
              className={classes.closeButton}
              onClick={onClose}
              aria-label="Fechar"
            >
              <Close />
            </IconButton>

            <div className={classes.badge}>
              <WhatsApp className={classes.badgeIcon} />
              CRM Ideia no Bolso
            </div>

            <Typography className={classes.title}>
              Conecte seu WhatsApp em segundos
            </Typography>
            <Typography className={classes.subtitle}>
              Escaneie o QR Code no celular para iniciar a sessão e liberar o atendimento desta conexão.
            </Typography>

            <Paper elevation={0} className={classes.stepCard}>
              <Typography className={classes.stepTitle}>1. Abra o WhatsApp no seu celular</Typography>
              <Typography className={classes.stepDescription}>
                Toque em menu ou configurações e entre em dispositivos conectados.
              </Typography>
            </Paper>
            <Paper elevation={0} className={classes.stepCard}>
              <Typography className={classes.stepTitle}>2. Escolha vincular um dispositivo</Typography>
              <Typography className={classes.stepDescription}>
                Aponte a câmera para o QR Code ao lado e aguarde a conexão.
              </Typography>
            </Paper>
            <Paper elevation={0} className={classes.stepCard}>
              <Typography className={classes.stepTitle}>3. Pronto para atender</Typography>
              <Typography className={classes.stepDescription}>
                Assim que o QR desaparecer, a sessão foi iniciada com sucesso.
              </Typography>
            </Paper>

            <Typography className={classes.connectionName}>
              Conexão: {whatsappName || `ID ${whatsAppId}`}
            </Typography>
          </div>

          <div className={classes.rightPanel}>
            <Paper elevation={0} className={classes.qrCard}>
              <Typography className={classes.qrTitle}>Leia o QR Code</Typography>
              <Typography className={classes.qrSubtitle}>
                Mantenha esta tela aberta enquanto faz a leitura pelo celular.
              </Typography>

              {qrCode ? (
                <div className={classes.qrCodeContainer}>
                  <QRCode
                    value={qrCode}
                    size={250}
                    renderAs="svg"
                    fgColor="#1b2334"
                    bgColor="#ffffff"
                    includeMargin
                    level="M"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              ) : (
                <div className={classes.loadingWrap}>
                  <CircularProgress size={34} thickness={4.4} style={{ color: "#2663c7" }} />
                  <Typography variant="body1" className={classes.loadingText}>
                    {isLoadingQrCode ? i18n.t("qrCode.waiting") : "Gerando QR Code..."}
                  </Typography>
                </div>
              )}

              <Typography className={classes.qrHint}>
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
