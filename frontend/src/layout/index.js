import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import clsx from "clsx";
import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  Button,
  MenuItem,
  IconButton,
  Menu,
  Popover,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  withStyles,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import api from "../services/api";
import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import BirthdayModal from "../components/BirthdayModal";
import ChatPopover from "../pages/Chat/ChatPopover";
import { useDate } from "../hooks/useDate";
import ColorModeContext from "../layout/themeContext";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import VersionControl from "../components/VersionControl";
import useSocketListener from "../hooks/useSocketListener";
import {
  CampaignRounded,
  CleaningServicesRounded,
  DarkModeRounded,
  LanguageRounded,
  LightModeRounded,
  NetworkCheckRounded,
  SignalWifi4BarRounded,
  SyncRounded,
} from "@mui/icons-material";

const backendUrl = getBackendUrl();
const drawerWidth = 240;


const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary.main, // Usa cor do tema
      border: `1px solid ${theme.palette.primary.main}40`,
      borderRadius: "8px",
      fontWeight: 600,
      textTransform: "none",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: `${theme.palette.primary.main}10`,
        borderColor: theme.palette.primary.main,
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
      },
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontWeight: 700,
    },
  },

  chip: {
    background: "red",
    color: "white",
  },

  avatar: {
    width: "100%",
  },

  toolbar: {
    paddingRight: 24,
    minHeight: 48,
    color: theme.palette.dark.main,
    // Usa a cor primÃ¡ria do tema para o fundo do AppBar
    background: theme.palette.primary.main, // MudanÃ§a principal aqui
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Sombra sutil
    transition: "all 0.3s ease",
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
    // ALTERAÃ‡ÃƒO: Removido o gradiente e definido fundo branco
    backgroundColor: "#ffffff", // Fundo branco fixo
    borderBottom: `1px solid ${theme.palette.divider}`, // Linha sutil para separaÃ§Ã£o
    transition: "all 0.3s ease",
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  menuButtonHidden: {
    display: "none",
  },

  title: {
    flexGrow: 1,
    fontSize: 13,
    color: "white",
    fontWeight: 700,
    letterSpacing: "0.01em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      fontSize: 11,
    },
  },

  drawerPaper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    minHeight: 0,
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "auto",
    // Melhorias sutis no drawer
    borderRight: `1px solid ${theme.mode === "light" ? "#e0e0e0" : "#424242"}`,
    boxShadow:
      theme.mode === "light"
        ? "2px 0 8px rgba(0, 0, 0, 0.1)"
        : "2px 0 8px rgba(0, 0, 0, 0.3)",
  },

  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "auto",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  appBarSpacer: {
    minHeight: "48px",
  },

  content: {
    flex: 1,
    overflow: "auto",
    padding: 0,
    margin: 0,
  },

  container: {
    padding: 0,
    margin: 0,
    maxWidth: "none",
    width: "100%",
  },

  containerWithScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    borderRadius: 0,
    border: "none",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background:
        theme.mode === "light"
          ? "rgba(15, 23, 42, 0.14)"
          : "rgba(255, 255, 255, 0.14)",
      borderRadius: "999px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background:
        theme.mode === "light"
          ? "rgba(15, 23, 42, 0.24)"
          : "rgba(255, 255, 255, 0.24)",
    },
    "-ms-overflow-style": "auto",
    "scrollbar-width": "thin",
  },

  NotificationsPopOver: {
    // MantÃ©m original
  },

  logo: {
    width: "100%",
    height: "45px",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "100%",
      maxWidth: 180,
    },
    logo: theme.logo,
    content:
      "url(" +
      (theme.mode === "light"
        ? theme.calculatedLogoLight()
        : theme.calculatedLogoDark()) +
      ")",
    transition: "all 0.3s ease", // TransiÃ§Ã£o suave
    "&:hover": {
      transform: "scale(1.02)", // Pequeno zoom no hover
    },
  },

  hideLogo: {
    display: "none",
  },

  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #ccc",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      borderColor: theme.palette.primary.main, // Usa cor do tema
    },
  },

  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  // BotÃµes da toolbar melhorados
  toolbarButton: {
    color: "rgba(255, 255, 255, 0.94)",
    borderRadius: "8px",
    padding: "6px",
    margin: "0 1px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },

  toolbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
    "& .MuiIconButton-root": {
      padding: 6,
      margin: "0 2px",
      borderRadius: 8,
      color: "white",
    },
    "& .MuiSvgIcon-root": {
      fontSize: 22,
    },
  },

  healthPillButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.55),
    minHeight: 28,
    marginRight: theme.spacing(0.55),
    padding: theme.spacing(0.2, 0.95),
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.18)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
    "&:hover": {
      background: "rgba(255,255,255,0.24)",
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.25, 0.75),
      marginRight: theme.spacing(0.45),
    },
  },

  healthDot: {
    width: 9,
    height: 9,
    minWidth: 9,
    borderRadius: "50%",
    boxShadow: "0 0 0 4px rgba(255,255,255,0.08)",
  },

  healthSignalIcon: {
    fontSize: 18,
    color: "rgba(255,255,255,0.95)",
  },

  healthSignalIconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    flexShrink: 0,
  },

  healthPillText: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.01em",
    color: "white",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      fontSize: 11,
    },
  },

  healthPopoverPaper: {
    marginTop: theme.spacing(0.8),
    minWidth: 250,
    padding: theme.spacing(0.8, 1.2),
    borderRadius: 4,
    background: "rgba(88, 88, 88, 0.94)",
    color: "white",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.24)",
    border: "none",
    overflow: "visible",
    "&:before": {
      content: '""',
      position: "absolute",
      top: -7,
      left: 42,
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent",
      borderBottom: "7px solid rgba(88, 88, 88, 0.94)",
    },
  },

  healthPopoverHeader: {
    display: "none",
  },

  healthPopoverTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "white",
  },

  healthPopoverRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(0.35, 0),
  },

  healthPopoverLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(255,255,255,0.86)",
  },

  healthPopoverValue: {
    fontSize: 13,
    fontWeight: 900,
    textAlign: "right",
  },

  // Menu hambÃºrguer com animaÃ§Ã£o sutil
  menuButton: {
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "& .MuiSvgIcon-root": {
      transition: "transform 0.3s ease",
    },
    "&:hover .MuiSvgIcon-root": {
      transform: "rotate(90deg)",
    },
  },

  // Seletor de idioma melhorado
  languageSelector: {
    position: "relative",
    display: "inline-block",
    "& > button": {
      background: "rgba(255, 255, 255, 0.1)",
      border: "none",
      borderRadius: "8px",
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: "18px",
      width: 34,
      height: 34,
      padding: 0,
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-1px)",
      },
    },
    "& > div": {
      position: "absolute",
      top: "45px",
      left: "0",
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      padding: "8px",
      zIndex: 1000,
      minWidth: "120px",
      "& button": {
        background: "none",
        border: "none",
        color: "#374151",
        display: "block",
        width: "100%",
        padding: "6px 10px",
        textAlign: "left",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 500,
        transition: "all 0.2s ease",
        "&:hover": {
          background: `${theme.palette.primary.main}10`, // Usa cor do tema
          color: theme.palette.primary.main, // Usa cor do tema
          transform: "none",
        },
      },
    },
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 12px",
    minHeight: 48,
    height: 48,
    backgroundColor:
      theme.mode === "light" ? "#ffffff" : theme.palette.fancyBackground,
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease",
    [theme.breakpoints.down("sm")]: {
      minHeight: 48,
      height: 48,
      padding: "0 10px",
    },
  },

  logoContainer: {
    display: "none",
  },

  logo: {
    display: "block",
    width: "100%",
    maxWidth: 156,
    height: 44,
    objectFit: "contain",
    objectPosition: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: 142,
      height: 40,
    },
  },

  // Badge animado
  animatedBadge: {
    "& .MuiBadge-badge": {
      animation: "$heartbeat 2s infinite",
    },
  },

  "@keyframes heartbeat": {
    "0%": { transform: "scale(1)" },
    "14%": { transform: "scale(1.1)" },
    "28%": { transform: "scale(1)" },
    "42%": { transform: "scale(1.1)" },
    "70%": { transform: "scale(1)" },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle, hideMenu = false }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading, user, socket } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");

  const [showOptions, setShowOptions] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [healthAnchorEl, setHealthAnchorEl] = useState(null);
  const [connectionHealth, setConnectionHealth] = useState({
    latency: null,
    quality: "Verificando",
    apiStatus: "Verificando",
    socketStatus: "Conectado",
  });

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  const resolveLatencyQuality = useCallback((latency) => {
    if (latency == null) {
      return "Verificando";
    }

    if (latency <= 120) {
      return "Excelente";
    }

    if (latency <= 220) {
      return "Bom";
    }

    if (latency <= 450) {
      return "Regular";
    }

    if (latency <= 800) {
      return "Ruim";
    }

    return "Pessimo";
  }, []);

  const resolveLatencyColor = useCallback((quality) => {
    if (quality === "Excelente" || quality === "Bom") {
      return "#22c55e";
    }

    if (quality === "Regular" || quality === "Verificando") {
      return "#facc15";
    }

    return "#ef4444";
  }, []);

  const resolveSignalLevel = useCallback((quality, apiStatus) => {
    if (apiStatus !== "Conectado") {
      return "low";
    }

    if (quality === "Excelente" || quality === "Bom") {
      return "full";
    }

    if (quality === "Regular") {
      return "medium";
    }

    return "low";
  }, []);

  const isSocketConnected = useCallback(() => {
    const rawSocket = socket?.socket || socket;
    return Boolean(rawSocket?.connected);
  }, [socket]);

  const measureConnectionHealth = useCallback(async () => {
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    let apiStatus = "Conectado";
    let latency = null;

    try {
      await api.get("/version", {
        params: { health: Date.now() },
      });

      const finishedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
      latency = Math.round(finishedAt - startedAt);
    } catch (error) {
      apiStatus = "InstÃ¡vel";
    }

    setConnectionHealth({
      latency,
      quality: resolveLatencyQuality(latency),
      apiStatus,
      socketStatus: isSocketConnected() ? "Conectado" : "Desconectado",
    });
  }, [isSocketConnected, resolveLatencyQuality]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get("/announcements/for-company", {
          params: {
            status: true,
            pageNumber: "1"
          }
        });

        // Filtra apenas os informativos ativos e nÃ£o expirados
        const activeAnnouncements = data.records.filter(announcement => {
          const isActive = announcement.status === true || announcement.status === "true";
          const isNotExpired = !announcement.expiresAt || new Date(announcement.expiresAt) > new Date();
          return isActive && isNotExpired;
        });

        setAnnouncements(activeAnnouncements);

        // Mostra o modal apenas se houver informativos ativos
        if (activeAnnouncements.length > 0) {
          setShowAnnouncementsModal(true);
        }
      } catch (err) {
        toastError(err);
      }
    };

    if (user?.id) {
      fetchAnnouncements();
    }
  }, [user?.id]);

  useEffect(() => {
    // if (localStorage.getItem("public-token") === null) {
    //   handleLogout()
    // }

    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user?.companyId;

    if (companyId) {
      const buildProfileUrl = () => {
        const savedProfileImage = localStorage.getItem("profileImage");
        const currentProfileImage = savedProfileImage || user.profileImage;

        if (currentProfileImage) {
          return `${backendUrl}/public/company${companyId}/user/${currentProfileImage}`;
        }
        return `${backendUrl}/public/app/noimage.png`;
      };

      setProfileUrl(buildProfileUrl());
    }
  }, [user?.companyId, user?.profileImage, backendUrl]);

  // Callbacks dos eventos
  const handleAuthEvent = useCallback((data) => {
    if (data.user.id === +user?.id) {
      toastError("Sua conta foi acessada em outro computador.");
      setTimeout(() => {
        localStorage.clear();
        window.location.reload();
      }, 1000);
    }
  }, [user?.id]);

  const handleUserUpdate = useCallback((data) => {
    if (data.action === "update" && data.user.id === +user?.id) {
      if (data.user.profileImage) {
        const newProfileUrl = `${backendUrl}/public/company${user?.companyId}/user/${data.user.profileImage}`;
        setProfileUrl(newProfileUrl);
        localStorage.setItem("profileImage", data.user.profileImage);
      }
    }
  }, [user?.companyId, user?.id, backendUrl]);

  // Callbacks para eventos de aniversÃ¡rio
  const handleUserBirthday = useCallback((data) => {
    console.log("ðŸŽ‚ Evento de aniversÃ¡rio de usuÃ¡rio recebido:", data);
    if (data.userId === +user?.id) {
      setShowBirthdayModal(true);
    }
  }, [user?.id]);

  const handleContactBirthday = useCallback((data) => {
    console.log("ðŸŽ‚ Evento de aniversÃ¡rio de contato recebido:", data);
    // Para contatos, apenas logamos por enquanto
    // A mensagem jÃ¡ foi enviada automaticamente pelo backend
  }, []);

  // Verificar aniversÃ¡rios no login
  const checkBirthdaysOnLogin = useCallback(async () => {
    if (user?.id && user?.companyId) {
      try {
        const { data } = await api.get("/birthdays/today");
        const birthdayData = data.data;

        // Verificar se o usuÃ¡rio atual faz aniversÃ¡rio hoje
        const userBirthday = birthdayData.users.find(u => u.id === +user.id);
        if (userBirthday) {
          console.log("ðŸŽ‚ UsuÃ¡rio faz aniversÃ¡rio hoje! Mostrando modal...");
          setShowBirthdayModal(true);
        }

        // Se hÃ¡ aniversariantes, mostrar notificaÃ§Ã£o
        if (birthdayData.users.length > 0 || birthdayData.contacts.length > 0) {
          console.log("ðŸŽ‚ HÃ¡ aniversariantes hoje:", birthdayData);
        }
      } catch (error) {
        console.error("Erro ao verificar aniversÃ¡rios:", error);
      }
    }
  }, [user?.id, user?.companyId]);

  // Registrar listeners
  useSocketListener(socket, user, 'auth', handleAuthEvent);
  useSocketListener(socket, user, 'user', handleUserUpdate);
  useSocketListener(socket, user, 'user-birthday', handleUserBirthday);
  useSocketListener(socket, user, 'contact-birthday', handleContactBirthday);

  // Verificar aniversÃ¡rios quando o usuÃ¡rio faz login
  useEffect(() => {
    if (user?.id && user?.companyId) {
      // Pequeno delay para garantir que o socket esteja conectado
      const timer = setTimeout(() => {
        checkBirthdaysOnLogin();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user?.id, user?.companyId, checkBirthdaysOnLogin]);

  // Status do usuÃ¡rio
  useEffect(() => {
    if (socket?.emit && user?.companyId) {
      socket.emit("heartbeat");

      const interval = setInterval(() => {
        socket?.emit && socket.emit("heartbeat");
      }, 1000 * 60 * 5);

      return () => clearInterval(interval);
    }
  }, [socket, user?.companyId]);

  useEffect(() => {
    measureConnectionHealth();
    const interval = setInterval(measureConnectionHealth, 30000);

    return () => clearInterval(interval);
  }, [measureConnectionHealth]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const syncSocketHealth = () => {
      setConnectionHealth((prevState) => ({
        ...prevState,
        socketStatus: isSocketConnected() ? "Conectado" : "Desconectado",
      }));
    };

    const rawSocket = socket?.socket || socket;
    rawSocket.on("connect", syncSocketHealth);
    rawSocket.on("disconnect", syncSocketHealth);
    syncSocketHealth();

    return () => {
      rawSocket.off("connect", syncSocketHealth);
      rawSocket.off("disconnect", syncSocketHealth);
    };
  }, [isSocketConnected, socket]);

  const handleUpdateStart = () => {
    setUpdateInProgress(true);
  };

  const handleUpdateComplete = () => {
    setUpdateInProgress(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleClearCache = async () => {
    handleCloseMenu();

    try {
      const appStorageKeys = [
        "appName",
        "primaryColorLight",
        "primaryColorDark",
        "frontendVersion",
      ];

      appStorageKeys.forEach((key) => localStorage.removeItem(key));

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } catch (error) {
      console.error("Erro ao limpar cache da aplicaÃƒÂ§ÃƒÂ£o:", error);
    } finally {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("cacheReset", Date.now().toString());
      window.location.replace(currentUrl.toString());
    }
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleOpenHealthPopover = (event) => {
    setHealthAnchorEl(event.currentTarget);
  };

  const handleCloseHealthPopover = () => {
    setHealthAnchorEl(null);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    window.location.reload();
  };

  const LANGUAGE_OPTIONS = [
    { code: "pt-BR", label: "PortuguÃªs" },
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "ar", label: "Ø¹Ø±Ø¨ÙŠ" },
  ];

  const [enabledLanguages, setEnabledLanguages] = useState(["pt-BR", "en"]);
  const { getAll } = useSettings();
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getAll();
        const enabledLanguagesSetting = settings.find(
          (s) => s.key === "enabledLanguages"
        )?.value;
        let langs = ["pt-BR", "en"];
        try {
          if (enabledLanguagesSetting) {
            langs = JSON.parse(enabledLanguagesSetting);
          }
        } catch { }
        console.log(
          "Layout - enabledLanguages carregadas:",
          langs,
          "para companyId:",
          user?.companyId
        );
        setEnabledLanguages(langs);
      } catch (error) {
        console.log("Layout - erro ao carregar enabledLanguages:", error);
      }
    }
    fetchSettings();
  }, [user?.companyId]);

  const filteredLanguageOptions = LANGUAGE_OPTIONS.filter((lang) =>
    enabledLanguages.includes(lang.code)
  );
  const flag = (...codePoints) => String.fromCodePoint(...codePoints);
  const LANGUAGE_META = {
    "pt-BR": { label: "Português-BR", flag: flag(0x1F1E7, 0x1F1F7) },
    en: { label: "English", flag: flag(0x1F1FA, 0x1F1F8) },
    es: { label: "Español", flag: flag(0x1F1EA, 0x1F1F8) },
    ar: { label: "العربية", flag: flag(0x1F1F8, 0x1F1E6) },
  };
  const decoratedLanguageOptions = filteredLanguageOptions.map((lang) => ({
    ...lang,
    label: LANGUAGE_META[lang.code]?.label || lang.label,
    flag: LANGUAGE_META[lang.code]?.flag || flag(0x1F310),
  }));
  const activeLanguageOption =
    decoratedLanguageOptions.find((lang) => lang.code === i18n.language) ||
    decoratedLanguageOptions.find((lang) => lang.code === user?.language) ||
    decoratedLanguageOptions[0] ||
    { label: "Idioma", flag: flag(0x1F310) };

  const healthPopoverOpen = Boolean(healthAnchorEl);
  const healthDotColor =
    connectionHealth.apiStatus === "Conectado"
      ? resolveLatencyColor(connectionHealth.quality)
      : "#ef4444";
  const signalLevel = resolveSignalLevel(
    connectionHealth.quality,
    connectionHealth.apiStatus
  );
  const signalIconStyle =
    signalLevel === "medium"
      ? {
          color: "#f59e0b",
          clipPath: "inset(45% 0 0 0)",
          transform: "translateY(1px)",
        }
      : signalLevel === "low"
        ? {
            color: "#ef4444",
            clipPath: "inset(72% 0 0 0)",
            transform: "translateY(3px)",
          }
        : {
            color: "rgba(255,255,255,0.95)",
          };
  const healthSummaryText =
    connectionHealth.latency != null
      ? `${connectionHealth.latency}ms`
      : connectionHealth.apiStatus === "Conectado"
        ? "Online"
        : "Offline";

  if (loading || updateInProgress) {
    return <BackdropLoading />;
  }

  return (
    <div className={clsx(classes.root, "logged-in-layout")}>
      {!hideMenu && (
        <Drawer
          variant={drawerVariant}
          className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
          classes={{
            paper: clsx(
              classes.drawerPaper,
              !drawerOpen && classes.drawerPaperClose
            ),
          }}
          open={drawerOpen}
        >
          <div className={classes.toolbarIcon}>
            <div className={drawerOpen ? classes.logoContainer : classes.hideLogo} />
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <List className={classes.containerWithScroll}>
            {/* {mainListItems} */}
            <MainListItems collapsed={!drawerOpen} />
          </List>
          <Divider />
        </Drawer>
      )}

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, !hideMenu && drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          {!hideMenu && (
            <IconButton
              edge="start"
              variant="contained"
              aria-label="open drawer"
              style={{ color: "white" }}
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={clsx(drawerOpen && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {/* {greaterThenSm && user?.profile === "admin" && getDateAndDifDays(user?.company?.dueDate).difData < 7 ? ( */}
            {greaterThenSm &&
              user?.profile === "admin" &&
              user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>! (
                {i18n.t("mainDrawer.appBar.user.active")}{" "}
                {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {!hideMenu && (
            <div className={classes.toolbarActions}>
              <button
                type="button"
                onClick={handleOpenHealthPopover}
                className={classes.healthPillButton}
              >
                <span className={classes.healthSignalIconWrap}>
                  <SignalWifi4BarRounded
                    className={classes.healthSignalIcon}
                    style={signalIconStyle}
                  />
                </span>
                <span
                  className={classes.healthDot}
                  style={{ backgroundColor: healthDotColor }}
                />
                <span className={classes.healthPillText}>{healthSummaryText}</span>
              </button>

              <Popover
                open={healthPopoverOpen}
                anchorEl={healthAnchorEl}
                onClose={handleCloseHealthPopover}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                classes={{ paper: classes.healthPopoverPaper }}
              >
                <div className={classes.healthPopoverHeader}>
                  <NetworkCheckRounded style={{ fontSize: 18, color: "#84cc16" }} />
                  <Typography className={classes.healthPopoverTitle}>
                    Integridade da conexÃƒÂ£o
                  </Typography>
                </div>
                <div className={classes.healthPopoverRow}>
                  <Typography className={classes.healthPopoverLabel}>
                    Latencia Atual:
                  </Typography>
                  <Typography
                    className={classes.healthPopoverValue}
                    style={{ color: resolveLatencyColor(connectionHealth.quality) }}
                  >
                    {connectionHealth.latency != null
                      ? `${connectionHealth.latency}ms - ${connectionHealth.quality}`
                      : connectionHealth.quality}
                  </Typography>
                </div>
                <div className={classes.healthPopoverRow} style={{ display: "none" }}>
                  <Typography className={classes.healthPopoverLabel}>
                    LatÃƒÂªncia atual:
                  </Typography>
                  <Typography
                    className={classes.healthPopoverValue}
                    style={{ color: connectionHealth.latency != null ? "#84cc16" : "#facc15" }}
                  >
                    {connectionHealth.latency != null
                      ? `${connectionHealth.latency}ms - ${connectionHealth.quality}`
                      : connectionHealth.quality}
                  </Typography>
                </div>
                <div className={classes.healthPopoverRow}>
                  <Typography className={classes.healthPopoverLabel}>
                    Status API:
                  </Typography>
                  <Typography
                    className={classes.healthPopoverValue}
                    style={{
                      color:
                        connectionHealth.apiStatus === "Conectado"
                          ? "#22c55e"
                          : "#f87171",
                    }}
                  >
                    {connectionHealth.apiStatus}
                  </Typography>
                </div>
                <div className={classes.healthPopoverRow}>
                  <Typography className={classes.healthPopoverLabel}>
                    Status Socket:
                  </Typography>
                  <Typography
                    className={classes.healthPopoverValue}
                    style={{
                      color:
                        connectionHealth.socketStatus === "Conectado"
                          ? "#22c55e"
                          : "#f87171",
                    }}
                  >
                    {connectionHealth.socketStatus}
                  </Typography>
                </div>
              </Popover>

              <VersionControl
                onUpdateStart={handleUpdateStart}
                onUpdateComplete={handleUpdateComplete}
              />

              <div
                style={{ position: "relative", display: "inline-block" }}
                className="language-dropdown"
              >
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    width: 34,
                    height: 34,
                    padding: 0,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 1px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                    aria-label={activeLanguageOption.label}
                    title={activeLanguageOption.label}
                  >
                    {activeLanguageOption.flag}
                  </span>
                </button>

                {showOptions && (
                  <div
                    style={{
                      position: "absolute",
                      top: "40px",
                      left: "0",
                      background: "#fff",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
                      borderRadius: "8px",
                      padding: "6px",
                      zIndex: 1000,
                      minWidth: "150px",
                      maxWidth: "200px",
                    }}
                  >
                    {decoratedLanguageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "block",
                          width: "100%",
                          padding: "3px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "8px",
                            width: "100%",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          <span style={{ fontSize: "16px", lineHeight: 1 }}>
                            {lang.flag}
                          </span>
                          <span>{lang.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <IconButton edge="start" onClick={colorMode.toggleColorMode}>
                {theme.mode === "dark" ? (
                  <LightModeRounded style={{ color: "white" }} />
                ) : (
                  <DarkModeRounded style={{ color: "white" }} />
                )}
              </IconButton>

              <NotificationsVolume setVolume={setVolume} volume={volume} />

              <IconButton
                onClick={handleRefreshPage}
                aria-label={i18n.t("mainDrawer.appBar.refresh")}
                color="inherit"
              >
                <SyncRounded style={{ color: "white" }} />
              </IconButton>

              {/* <DarkMode themeToggle={themeToggle} /> */}

              {user.id && <NotificationsPopOver volume={volume} />}

              <AnnouncementsPopover />

              <ChatPopover />



              <div className="user-menu-wrapper">
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                  onClick={handleMenu}
                >
                  <Avatar
                    alt="Multi100"
                    className={classes.avatar2}
                    src={profileUrl}
                  />
                </StyledBadge>

                <UserModal
                  open={userModalOpen}
                  onClose={() => setUserModalOpen(false)}
                  onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
                  userId={user?.id}
                />

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={menuOpen}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    style: {
                      minWidth: "150px",
                      maxWidth: "200px",
                      width: "auto",
                    },
                  }}
                >
                  <MenuItem onClick={handleOpenUserModal}>
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </MenuItem>
                  <MenuItem onClick={handleClearCache}>
                    <CleaningServicesRounded
                      style={{ fontSize: 18, marginRight: 10 }}
                    />
                    {i18n.t("mainDrawer.appBar.user.clearCache")}
                  </MenuItem>
                  <MenuItem onClick={handleClickLogout}>
                    {i18n.t("mainDrawer.appBar.user.logout")}
                  </MenuItem>
                </Menu>
              </div>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>

      {/* Modal de Informativos */}
      <Dialog
        open={showAnnouncementsModal}
        onClose={() => setShowAnnouncementsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Informativos</DialogTitle>
        <DialogContent dividers>
          {selectedAnnouncement ? (
            <div>
              <Typography variant="h6" gutterBottom>
                {selectedAnnouncement.title}
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {selectedAnnouncement.text}
              </Typography>
              {selectedAnnouncement.mediaPath && (
                <div style={{ marginTop: 16 }}>
                  <img
                    src={`${backendUrl}/public/company${user.companyId}${selectedAnnouncement.mediaPath}`}
                    alt="Anexo"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
              <Button
                onClick={() => setSelectedAnnouncement(null)}
                style={{ marginTop: 16 }}
                variant="outlined"
              >
                Voltar para lista
              </Button>
            </div>
          ) : (
            <List>
              {announcements.map((announcement) => (
                <ListItem
                  button
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <CampaignRounded />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          Prioridade: {announcement.priority === 1 ? 'Alta' : announcement.priority === 2 ? 'MÃ©dia' : 'Baixa'}
                        </Typography>
                        {` â€” ${new Date(announcement.createdAt).toLocaleDateString()}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowAnnouncementsModal(false)}
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de AniversÃ¡rio */}
      <BirthdayModal
        open={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        user={user}
      />

    </div>
  );
};

export default LoggedInLayout;
