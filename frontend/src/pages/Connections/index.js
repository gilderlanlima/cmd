import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  Sync,
} from "@material-ui/icons";
import WebhookIcon from '@mui/icons-material/Webhook';
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import Skeleton from "@material-ui/lab/Skeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from '../../utils/formatSerializedId';
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import ConnectionIcon from "../../components/ConnectionIcon";
import { getChannelMeta } from "../../utils/channelCatalog";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  connectionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
  },
  connectionCard: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 14,
    overflow: "hidden",
    border: theme.mode === "light" ? "1px solid #edeff5" : "1px solid #333",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    "&:hover": {
      boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
      transform: "translateY(-2px)",
    },
  },
  connectionCardColorBar: {
    height: 4,
    width: "100%",
  },
  connectionCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
    padding: theme.spacing(2),
    flex: 1,
  },
  connectionCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.25),
  },
  connectionChannelIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.mode === "light" ? "#f5f6fa" : "#2a2a2a",
    flexShrink: 0,
  },
  connectionTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  connectionName: {
    fontWeight: 700,
    fontSize: "0.95rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  connectionNumber: {
    fontSize: "0.8rem",
    color: theme.mode === "light" ? "#8b8f9d" : "#aaa",
    marginTop: 2,
  },
  connectionStatusRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontSize: "0.82rem",
    fontWeight: 600,
  },
  connectionActionsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: "auto",
  },
  connectionCardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
    borderTop: theme.mode === "light" ? "1px solid #f1f2f7" : "1px solid #333",
    backgroundColor: theme.mode === "light" ? "#fafbfd" : "#242424",
  },
  connectionUpdatedAt: {
    fontSize: "0.72rem",
    color: theme.mode === "light" ? "#a1a5b7" : "#888",
  },
  connectionIconActions: {
    display: "flex",
    alignItems: "center",
  },
  connectionEmptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.mode === "light" ? "#9aa0b4" : "#888",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [channel, setChannel] = useState("whatsapp");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);
  const [planConfig, setPlanConfig] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceConnection, setSourceConnection] = useState("");
  const [targetConnection, setTargetConnection] = useState("");
  const [preDeleteModalOpen, setPreDeleteModalOpen] = useState(false);
  const [whatsAppToDelete, setWhatsAppToDelete] = useState(null);
  const [transferProgressModalOpen, setTransferProgressModalOpen] = useState(false);
  const [transferProgress, setTransferProgress] = useState({ current: 0, total: 0, percentage: 0 });

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs)
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    if (!socket || !user?.companyId) return;

    const onImportMessages = (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        history.go(0);
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    };

    const onTransferTickets = (data) => {
      if (data.action === "progress") {
        setTransferProgress({
          current: data.current,
          total: data.total,
          percentage: Math.round((data.current / data.total) * 100)
        });
      }
      if (data.action === "completed") {
        setTransferProgressModalOpen(false);
        setTransferProgress({ current: 0, total: 0, percentage: 0 });
        toast.success(`Transferência concluída! ${data.transferred} tickets transferidos com sucesso.`);
        handleCloseTransferModal();
      }
      if (data.action === "error") {
        setTransferProgressModalOpen(false);
        setTransferProgress({ current: 0, total: 0, percentage: 0 });
        toast.error("Erro na transferência de tickets.");
      }
    };

    const importEvent = `importMessages-${user.companyId}`;
    const transferEvent = `transferTickets-${user.companyId}`;

    socket.on(importEvent, onImportMessages);
    socket.on(transferEvent, onTransferTickets);

    return () => {
      socket.off(importEvent, onImportMessages);
      socket.off(transferEvent, onTransferTickets);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.companyId]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = (channel) => {
    setChannel(channel)
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setChannel(whatsApp.channel)
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleSyncTemplates = async (whatsAppId) => {
    await api.get(`/whatsapp/sync-templates/${whatsAppId}`);
  }

  const handleCopyWebhook = (url) => {
    navigator.clipboard.writeText(url); // Copia o token para a área de transferência    
  };

  const openInNewTab = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }

    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }


    setConfirmModalInfo(confirmationModalInitialState);
  };


  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.channel === "whatsapp" && whatsApp.status === "qrcode" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.channel === "whatsapp" && whatsApp.status === "DISCONNECTED" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>{" "}
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {(whatsApp.channel === "whatsapp" && (whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT")) && (
            <Can
              role={user.profile}
              perform="connections-page:addConnection"
              yes={() => (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      handleOpenConfirmationModal("disconnect", whatsApp.id);
                    }}
                  >
                    {i18n.t("connections.buttons.disconnect")}
                  </Button>

                  {renderImportButton(whatsApp)}
                </>
              )}
            />
          )}
        {(whatsApp.channel === "whatsapp" && whatsApp.status === "OPENING") && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
        {["telegram", "tiktok", "webchat"].includes(whatsApp.channel) && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleEditWhatsApp(whatsApp)}
          >
            Configurar canal
          </Button>
        )}
        {(whatsApp.channel === "facebook" || whatsApp.channel === "instagram") &&
          whatsApp.status === "CONNECTED" && (
            <Chip
              size="small"
              label="Canal ativo"
              style={{ backgroundColor: "#E2F7E8", color: "#166534", fontWeight: 700 }}
            />
          )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const getStatusLabel = (whatsApp) => {
    const labels = {
      DISCONNECTED: { text: i18n.t("connections.toolTips.disconnected.title"), color: "#e74c3c" },
      OPENING: { text: i18n.t("connections.buttons.connecting"), color: "#8b8f9d" },
      qrcode: { text: i18n.t("connections.toolTips.qrcode.title"), color: "#f5a623" },
      CONNECTED: { text: i18n.t("connections.toolTips.connected.title"), color: "#22a860" },
      TIMEOUT: { text: i18n.t("connections.toolTips.timeout.title"), color: "#e74c3c" },
      PAIRING: { text: i18n.t("connections.toolTips.timeout.title"), color: "#e74c3c" },
    };
    return labels[whatsApp.status] || { text: whatsApp.status, color: "#8b8f9d" };
  };

  const restartWhatsapps = async () => {

    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  }

  const handleOpenTransferModal = () => {
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setSourceConnection("");
    setTargetConnection("");
  };

  const handleCloseTransferProgressModal = () => {
    setTransferProgressModalOpen(false);
    setTransferProgress({ current: 0, total: 0, percentage: 0 });
  };

  const handleTransferTickets = async () => {
    if (!sourceConnection || !targetConnection) {
      toast.error("Selecione as conexões de origem e destino");
      return;
    }

    if (sourceConnection === targetConnection) {
      toast.error("As conexões de origem e destino devem ser diferentes");
      return;
    }

    try {
      const response = await api.post(`/transfer-tickets`, {
        sourceConnectionId: sourceConnection,
        targetConnectionId: targetConnection
      });

      if (response.data.requiresProgress) {
        setTransferModalOpen(false);
        setTransferProgressModalOpen(true);
        setTransferProgress({ current: 0, total: response.data.totalTickets, percentage: 0 });
      } else {
        toast.success(`Tickets transferidos com sucesso! ${response.data.transferred || 0} tickets transferidos.`);
        handleCloseTransferModal();
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenPreDeleteModal = (whatsAppId) => {
    setWhatsAppToDelete(whatsAppId);
    setPreDeleteModalOpen(true);
  };

  const handleClosePreDeleteModal = () => {
    setPreDeleteModalOpen(false);
    setWhatsAppToDelete(null);
  };

  const handleConfirmTransferDone = () => {
    setPreDeleteModalOpen(false);
    handleOpenConfirmationModal("delete", whatsAppToDelete);
    setWhatsAppToDelete(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        channel={channel}
      />
      <Dialog
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transferência de Tickets</DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ marginBottom: 24, lineHeight: 1.6 }}>
            Para transferir os tickets, selecione a conexão de <strong>origem</strong> (de onde os tickets serão movidos) 
            e a conexão de <strong>destino</strong> (para onde os tickets serão transferidos). 
            Todos os atendimentos ativos da conexão de origem serão movidos para a conexão de destino.
          </Typography>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <FormControl fullWidth>
              <InputLabel>Origem</InputLabel>
              <Select
                value={sourceConnection}
                onChange={(e) => setSourceConnection(e.target.value)}
                label="Origem"
              >
                {whatsApps.map((whatsApp) => (
                  <MuiMenuItem key={whatsApp.id} value={whatsApp.id}>
                    {whatsApp.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>

            <div style={{ fontSize: 24, color: '#4caf50', fontWeight: 'bold' }}>
              →
            </div>

            <FormControl fullWidth>
              <InputLabel>Destino</InputLabel>
              <Select
                value={targetConnection}
                onChange={(e) => setTargetConnection(e.target.value)}
                label="Destino"
              >
                {whatsApps.map((whatsApp) => (
                  <MuiMenuItem key={whatsApp.id} value={whatsApp.id}>
                    {whatsApp.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferModal} color="default">
            CANCELAR
          </Button>
          <Button onClick={handleTransferTickets} color="primary" variant="contained">
            TRANSFERIR
                     </Button>
         </DialogActions>
       </Dialog>
       <Dialog
         open={transferProgressModalOpen}
         onClose={handleCloseTransferProgressModal}
         maxWidth="sm"
         fullWidth
         disableBackdropClick
         disableEscapeKeyDown
       >
         <DialogTitle>Transferindo Tickets</DialogTitle>
         <DialogContent>
           <div style={{ textAlign: 'center', padding: '20px 0' }}>
             <Typography variant="h6" style={{ marginBottom: 16 }}>
               Progresso da Transferência
             </Typography>
             
             <Box position="relative" display="inline-flex" marginBottom={2}>
               <CircularProgress 
                 variant="determinate" 
                 value={transferProgress.percentage} 
                 size={80}
                 thickness={4}
               />
               <Box
                 top={0}
                 left={0}
                 bottom={0}
                 right={0}
                 position="absolute"
                 display="flex"
                 alignItems="center"
                 justifyContent="center"
               >
                 <Typography variant="caption" component="div" color="textSecondary" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                   {transferProgress.percentage}%
                 </Typography>
               </Box>
             </Box>

             <Typography variant="body1" style={{ marginTop: 16 }}>
               {transferProgress.current} de {transferProgress.total} tickets transferidos
             </Typography>
             
             <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
               Por favor, aguarde enquanto os tickets são transferidos...
             </Typography>
           </div>
         </DialogContent>
       </Dialog>
       <Dialog
         open={preDeleteModalOpen}
         onClose={handleClosePreDeleteModal}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>Transferência de Tickets</DialogTitle>
         <DialogContent>
           <Typography variant="body1" style={{ marginBottom: 16 }}>
             Antes de excluir esta conexão, você já fez a transferência dos tickets para outra conexão?
           </Typography>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleClosePreDeleteModal} color="default">
             NÃO
           </Button>
           <Button onClick={handleConfirmTransferDone} color="primary" variant="contained">
             SIM
           </Button>
         </DialogActions>
       </Dialog>
      {user.profile === "user" && user.allowConnections === "disabled" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>{i18n.t("connections.title")} ({whatsApps.length})</Title>
            <MainHeaderButtonsWrapper>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenTransferModal}
              >
                Transferir Tickets
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={restartWhatsapps}
              >
                {i18n.t("connections.restartConnections")}
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => openInNewTab(`https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}`)}
              >
                {i18n.t("connections.callSupport")}
              </Button>
              <PopupState variant="popover" popupId="demo-popup-menu">
                {(popupState) => (
                  <React.Fragment>
                    <Can
                      role={user.profile}
                      perform="connections-page:addConnection"
                      yes={() => (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            {...bindTrigger(popupState)}
                          >
                            {i18n.t("connections.newConnection")}
                          </Button>
                          <Menu {...bindMenu(popupState)}>
                            {/* WHATSAPP */}
                            <MenuItem
                              disabled={planConfig?.plan?.useWhatsapp ? false : true}
                              onClick={() => {
                                handleOpenWhatsAppModal();
                                popupState.close();
                              }}
                            >
                              <WhatsApp
                                fontSize="small"
                                style={{
                                  marginRight: "10px",
                                  color: "#25D366",
                                }}
                              />
                              WhatsApp
                            </MenuItem>
                            {/* WHATSAPP OFICIAL */}
                            <MenuItem
                              disabled={planConfig?.plan?.useWhatsappOfficial ? false : true}
                              onClick={() => {
                                handleOpenWhatsAppModal("whatsapp_oficial");
                                popupState.close();
                              }}
                            >
                              <WhatsApp
                                fontSize="small"
                                style={{
                                  marginRight: "10px",
                                  color: "#25D366",
                                }}
                              />
                              WhatsApp Oficial
                            </MenuItem>
                            {/* FACEBOOK */}
                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="9.0"
                              scope={process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE" ?
                                "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                                : "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"}
                              callback={responseFacebook}
                              render={(renderProps) => (
                                <MenuItem
                                  disabled={planConfig?.plan?.useFacebook ? false : true}
                                  onClick={renderProps.onClick}
                                >
                                  <Facebook
                                    fontSize="small"
                                    style={{
                                      marginRight: "10px",
                                      color: "#3b5998",
                                    }}
                                  />
                                  Facebook
                                </MenuItem>
                              )}
                            />
                            {/* INSTAGRAM */}
                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="9.0"
                              scope={process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE" ?
                                "public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                                : "public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"}
                              callback={responseInstagram}
                              render={(renderProps) => (
                                <MenuItem
                                  disabled={planConfig?.plan?.useInstagram ? false : true}
                                  onClick={renderProps.onClick}
                                >
                                  <Instagram
                                    fontSize="small"
                                    style={{
                                      marginRight: "10px",
                                      color: "#e1306c",
                                    }}
                                  />
                                  Instagram
                                </MenuItem>
                              )}
                            />
                            <MenuItem
                              onClick={() => {
                                handleOpenWhatsAppModal("telegram");
                                popupState.close();
                              }}
                            >
                              <ConnectionIcon
                                connectionType="telegram"
                                size={16}
                                style={{ marginRight: 10, marginBottom: 0 }}
                              />
                              Telegram
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleOpenWhatsAppModal("tiktok");
                                popupState.close();
                              }}
                            >
                              <ConnectionIcon
                                connectionType="tiktok"
                                size={16}
                                style={{ marginRight: 10, marginBottom: 0 }}
                              />
                              TikTok
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleOpenWhatsAppModal("webchat");
                                popupState.close();
                              }}
                            >
                              <ConnectionIcon
                                connectionType="webchat"
                                size={16}
                                style={{ marginRight: 10, marginBottom: 0 }}
                              />
                              Web Chat
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    />
                  </React.Fragment>
                )}
              </PopupState>
            </MainHeaderButtonsWrapper>
          </MainHeader>

          {
            statusImport?.all ? (
              <>
                <div style={{ margin: "auto", marginBottom: 12 }}>
                  <Card className={classes.root}>
                    <CardContent className={classes.content}>
                      <Typography component="h5" variant="h5">

                        {statusImport?.this === -1 ? i18n.t("connections.buttons.preparing") : i18n.t("connections.buttons.importing")}

                      </Typography>
                      {statusImport?.this === -1 ?
                        <Typography component="h6" variant="h6" align="center">

                          <CircularProgress
                            size={24}
                          />

                        </Typography>
                        :
                        <>
                          <Typography component="h6" variant="h6" align="center">
                            {`${i18n.t(`connections.typography.processed`)} ${statusImport?.this} ${i18n.t(`connections.typography.in`)} ${statusImport?.all}  ${i18n.t(`connections.typography.date`)}: ${statusImport?.date} `}
                          </Typography>
                          <Typography align="center">
                            <CircularProgressWithLabel
                              style={{ margin: "auto" }}
                              value={(statusImport?.this / statusImport?.all) * 100}
                            />
                          </Typography>
                        </>
                      }
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null
          }

          <Paper className={classes.mainPaper} variant="outlined">
            {loading ? (
              <div className={classes.connectionsGrid}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={classes.connectionCard} style={{ minHeight: 180, padding: 16 }}>
                    <Skeleton animation="wave" variant="circle" width={40} height={40} style={{ marginBottom: 12 }} />
                    <Skeleton animation="wave" height={24} width="70%" style={{ marginBottom: 8 }} />
                    <Skeleton animation="wave" height={18} width="45%" style={{ marginBottom: 16 }} />
                    <Skeleton animation="wave" height={32} width="60%" />
                  </div>
                ))}
              </div>
            ) : whatsApps?.length > 0 ? (
              <div className={classes.connectionsGrid}>
                {whatsApps.map((whatsApp) => {
                  const status = getStatusLabel(whatsApp);
                  const number =
                    whatsApp.channel === "whatsapp" && whatsApp.number
                      ? formatSerializedId(whatsApp.number)
                      : whatsApp.channel === "whatsapp_oficial" && whatsApp.phone_number
                        ? formatSerializedId(whatsApp.phone_number)
                        : null;

                  return (
                    <Card key={whatsApp.id} className={classes.connectionCard} variant="outlined">
                      <div
                        className={classes.connectionCardColorBar}
                        style={{ backgroundColor: whatsApp.color || "#ddd" }}
                      />
                      <CardContent className={classes.connectionCardContent}>
                        <div className={classes.connectionCardHeader}>
                          <Tooltip title={getChannelMeta(whatsApp.channel).label}>
                            <div className={classes.connectionChannelIcon}>
                              {getChannelMeta(whatsApp.channel).render({ size: 20, fontSize: "small" })}
                            </div>
                          </Tooltip>
                          <div className={classes.connectionTitleGroup}>
                            <Typography className={classes.connectionName} title={whatsApp.name}>
                              {whatsApp.name}
                            </Typography>
                            <Typography className={classes.connectionNumber}>
                              {number || "—"}
                            </Typography>
                          </div>
                          {whatsApp.isDefault && (
                            <Chip
                              size="small"
                              label={i18n.t("connections.table.default")}
                              style={{ backgroundColor: "#E2F7E8", color: "#166534", fontWeight: 700 }}
                            />
                          )}
                        </div>

                        <div className={classes.connectionStatusRow}>
                          {renderStatusToolTips(whatsApp)}
                          <span style={{ color: status.color }}>{status.text}</span>
                        </div>

                        <div className={classes.connectionActionsRow}>
                          {renderActionButtons(whatsApp)}
                        </div>
                      </CardContent>

                      <div className={classes.connectionCardFooter}>
                        <Typography className={classes.connectionUpdatedAt}>
                          {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                        </Typography>
                        <Can
                          role={user.profile}
                          perform="connections-page:addConnection"
                          yes={() => (
                            <div className={classes.connectionIconActions}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditWhatsApp(whatsApp)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  handleOpenPreDeleteModal(whatsApp.id);
                                }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                              {whatsApp.channel === "whatsapp_oficial" && (
                                <>
                                  <Tooltip title="Sincronizar templates">
                                    <IconButton
                                      size="small"
                                      aria-label="sync-templates"
                                      onClick={(e) => {
                                        handleSyncTemplates(whatsApp.id);
                                      }}
                                    >
                                      <Sync fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Copiar webhook para Meta">
                                    <IconButton
                                      size="small"
                                      aria-label="copy-webhook"
                                      onClick={(e) => {
                                        handleCopyWebhook(whatsApp.waba_webhook);
                                      }}
                                    >
                                      <WebhookIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className={classes.connectionEmptyState}>
                <Typography>{i18n.t("connections.title")}</Typography>
              </div>
            )}
          </Paper>
        </>
      }
    </MainContainer >

  );
};

export default Connections;
