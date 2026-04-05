import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import {
  AllInclusive,
  AttachFile,
  Dashboard,
  DeviceHubOutlined,
  PhonelinkSetup,
} from "@material-ui/icons";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";

import { Can } from "../components/Can";

import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import { Campaign, ShapeLine, Webhook } from "@mui/icons-material";
import packageJson from "../../package.json";

import useCompanySettings from "../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "44px",
    width: "calc(100% - 12px)",
    margin: "4px 6px",
    borderRadius: 12,
    "&:hover $iconHoverActive": {
      backgroundColor: theme.palette.primary.main, // Usa cor do tema
      color: "#fff",
      transform: "scale(1.05)",
    },
    "&:hover $listItemText": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontWeight: 600,
    },
    // Transição suave
    transition: "all 0.3s ease",
  },

  activeListItem: {
    backgroundColor:
      theme.mode === "light"
        ? "rgba(0, 0, 0, 0.08)"
        : "rgba(255, 255, 255, 0.12)",
    "& $listItemText": {
      fontWeight: 700,
    },
  },

  listItemText: {
    fontSize: "14px",
    color: theme.mode === "light" ? "#666" : "#FFF",
    transition: "color 0.3s ease", // Só transição de cor
    fontWeight: 500,
    "& .MuiTypography-root": {
      fontFamily: "'Inter', 'Roboto', sans-serif",
    }
  },

  avatarActive: {
    backgroundColor: "transparent",
  },

  avatarHover: {
    backgroundColor: "transparent",
  },

  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%", // Mantém circular original
    height: 36, // Mantém tamanho original
    width: 36,  // Mantém tamanho original
    backgroundColor:
      theme.mode === "light"
        ? "rgba(120,120,120,0.1)"
        : "rgba(120,120,120,0.5)",
    color: theme.mode === "light" ? "#666" : "#FFF",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Transição mais suave
    "&:hover, &.active": {
      backgroundColor: theme.palette.primary.main, // Usa cor do tema
      color: "#fff",
      boxShadow: `0 4px 12px ${theme.palette.primary.main}30`, // Sombra dinâmica
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.4rem", // Mantém tamanho original
      transition: "transform 0.3s ease",
    },
    "&:hover .MuiSvgIcon-root": {
      transform: "scale(1.1)", // Pequena animação no hover
    }
  },

  // Badge melhorado mas mantendo funcionalidade
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ef4444",
      color: "#fff",
      fontSize: "0.75rem",
      fontWeight: 600,
      animation: "$pulse 2s infinite",
    }
  },

  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.7,
    }
  },

  // Melhorias para submenus mantendo estrutura original
  submenuContainer: {
    backgroundColor: theme.mode === "light"
      ? "rgba(0, 0, 0, 0.02)"
      : "rgba(255, 255, 255, 0.02)",
  },

  // Tooltip melhorado
  customTooltip: {
    backgroundColor: theme.mode === "light" ? "#1e293b" : "#374151",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    "& .MuiTooltip-arrow": {
      color: theme.mode === "light" ? "#1e293b" : "#374151",
    }
  },

  // Versão com destaque sutil
  versionContainer: {
    textAlign: "center",
    padding: "8px 10px 10px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontFamily: "'Segoe UI', 'Inter', 'Roboto', sans-serif",
    borderTop: `1px solid ${theme.mode === "light" ? "#f0f0f0" : "#333"}`,
    marginTop: "auto",
  },

  // Seções de administração com destaque sutil
  adminSection: {
    "& .MuiListSubheader-root": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }
  },

  // Efeitos suaves para expand/collapse
  expandIcon: {
    transition: "transform 0.3s ease",
    color: theme.palette.primary.main, // Usa cor do tema
    "&.expanded": {
      transform: "rotate(180deg)",
    }
  },

  // Menu container com melhorias sutis
  menuContainer: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: theme.mode === "light"
        ? "rgba(0, 0, 0, 0.1)"
        : "rgba(255, 255, 255, 0.1)",
      borderRadius: "3px",
      "&:hover": {
        background: theme.mode === "light"
          ? "rgba(0, 0, 0, 0.2)"
          : "rgba(255, 255, 255, 0.2)",
      }
    },
  },

  // Estado ativo melhorado mantendo funcionalidade original
  activeItem: {
    "& $iconHoverActive": {
      backgroundColor: theme.palette.primary.main, // Usa cor do tema
      color: "#fff",
    },
    "& $listItemText": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontWeight: 700,
    }
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, activePaths = [] } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive =
    activeMenu === to ||
    location.pathname === to ||
    activePaths.includes(location.pathname);

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem
          button
          component={renderLink}
          className={`${classes.listItem} ${isActive ? classes.activeListItem : ""}`}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  className={classes.badge}
                >
                  <Avatar
                    className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                      }`}
                  >
                    {icon}
                  </Avatar>
                </Badge>
              ) : (
                <Avatar
                  className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                    }`}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);

  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showWavoipCall, setShowWavoipCall] = useState(false);

  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const { list } = useHelps(); // INSERIR
  const [hasHelps, setHasHelps] = useState(false);

  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [flowHover, setFlowHover] = useState(false);

  const { get: getSetting } = useCompanySettings();
  const [showWallets, setShowWallets] = useState(false);
  const displayVersion = version || packageJson.version;

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    // INSERIR ESSE EFFECT INTEIRO
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting(
          {
            "column": "DirectTicketsToWallets"
          }
        );

        setShowWallets(setting.DirectTicketsToWallets);

      } catch (err) {
        toastError(err);
      }
    }

    fetchSettings();
  }, [setShowWallets]);

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowWavoipCall(planConfigs.plan.wavoip);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id && socket && typeof socket.on === 'function') {
      const companyId = user.companyId;

      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      const eventName = `company-${companyId}-chat`;
      console.log('Registrando listener para:', eventName);

      socket.on(eventName, onCompanyChatMainListItems);

      return () => {
        if (socket && typeof socket.off === 'function') {
          console.log('Removendo listener para:', eventName);
          socket.off(eventName, onCompanyChatMainListItems);
        }
      };
    }
  }, [socket, user.id, user.companyId]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
            user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <ListItemLink
              to="/"
              primary={i18n.t("mainDrawer.listItems.management")}
              icon={<Dashboard />}
              tooltip={collapsed}
              activePaths={["/reports", "/moments"]}
            />
            {user.profile === "admin" && showWallets && (
              <ListItemLink
                to="/wallets"
                primary={i18n.t("mainDrawer.listItems.wallets")}
                icon={<AccountBalanceWalletIcon />}
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
        tooltip={collapsed}
      />

      {showWavoipCall && (
        <ListItemLink
          to="/call-historicals"
          primary={i18n.t("mainDrawer.listItems.callHistorical")}
          icon={<HistoryToggleOffIcon />}
          tooltip={collapsed}
        />
      )}

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<FlashOnIcon />}
        tooltip={collapsed}
      />

      {showCampaigns && (
        <ListItemLink
          to="/nova-transmissao"
          primary="Nova Transmissão"
          icon={<Campaign />}
          tooltip={collapsed}
          activePaths={["/campaigns", "/contact-lists", "/campaigns-config"]}
        />
      )}

      {user.showContacts === "enabled" && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<ContactPhoneOutlinedIcon />}
          tooltip={collapsed}
        />
      )}

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<Schedule />}
            tooltip={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOfferIcon />}
        tooltip={collapsed}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <ForumIcon />
              </Badge>
            }
            tooltip={collapsed}
          />
        </>
      )}

      {/* 
      <ListItemLink
        to="/todolist"
        primary={i18n.t("ToDoList")}
        icon={<EventAvailableIcon />}
      /> 
      */}

      {hasHelps && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpOutlineIcon />}
          tooltip={collapsed}
        />
      )}

      {user?.showCampaign === "enabled" && showCampaigns && (
        <>
          <Tooltip
            title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""}
            placement="right"
          >
            <ListItem
              dense
              button
              className={`${classes.listItem} ${isCampaignRouteActive ? classes.activeListItem : ""}`}
              onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
              onMouseEnter={() => setCampaignHover(true)}
              onMouseLeave={() => setCampaignHover(false)}
            >
              <ListItemIcon>
                <Avatar
                  className={`${classes.iconHoverActive} ${isCampaignRouteActive || campaignHover ? "active" : ""}`}
                >
                  <EventAvailableIcon />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography className={classes.listItemText}>
                    {i18n.t("mainDrawer.listItems.campaigns")}
                  </Typography>
                }
              />
              {openCampaignSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
          </Tooltip>
          <Collapse
            in={openCampaignSubmenu}
            timeout="auto"
            unmountOnExit
            style={{
              backgroundColor:
                theme.mode === "light"
                  ? "rgba(120,120,120,0.1)"
                  : "rgba(120,120,120,0.5)",
            }}
          >
            <List dense component="div" disablePadding>
              <ListItemLink
                to="/campaigns"
                primary={i18n.t("campaigns.subMenus.list")}
                icon={<ListIcon />}
                tooltip={collapsed}
              />
              <ListItemLink
                to="/contact-lists"
                primary={i18n.t("campaigns.subMenus.listContacts")}
                icon={<PeopleIcon />}
                tooltip={collapsed}
              />
              <ListItemLink
                to="/campaigns-config"
                primary={i18n.t("campaigns.subMenus.settings")}
                icon={<SettingsOutlinedIcon />}
                tooltip={collapsed}
              />
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/files"
                    primary={i18n.t("mainDrawer.listItems.files")}
                    icon={<AttachFile />}
                    tooltip={collapsed}
                  />
                )}
              />
            </List>
          </Collapse>
        </>
      )}

      {/* FLOWBUILDER */}
      {user.showFlow === "enabled" && (
        <>
          <Tooltip
            title={
              collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""
            }
            placement="right"
          >
            <ListItem
              dense
              button
              className={`${classes.listItem} ${isFlowbuilderRouteActive ? classes.activeListItem : ""}`}
              onClick={() => setOpenFlowSubmenu((prev) => !prev)}
              onMouseEnter={() => setFlowHover(true)}
              onMouseLeave={() => setFlowHover(false)}
            >
              <ListItemIcon>
                <Avatar
                  className={`${classes.iconHoverActive} ${isFlowbuilderRouteActive || flowHover
                    ? "active"
                    : ""
                    }`}
                >
                  <Webhook />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography className={classes.listItemText}>
                    {i18n.t("Flowbuilder")}
                  </Typography>
                }
              />
              {openFlowSubmenu ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </ListItem>
          </Tooltip>

          <Collapse
            in={openFlowSubmenu}
            timeout="auto"
            unmountOnExit
            style={{
              backgroundColor:
                theme.mode === "light"
                  ? "rgba(120,120,120,0.1)"
                  : "rgba(120,120,120,0.5)",
            }}
          >
            <List dense component="div" disablePadding>
              <ListItemLink
                to="/phrase-lists"
                primary={"Fluxo de Campanha"}
                icon={<EventAvailableIcon />}
                tooltip={collapsed}
              />

              <ListItemLink
                to="/flowbuilders"
                primary={"Fluxo de conversa"}
                icon={<ShapeLine />}
              />
            </List>
          </Collapse>
        </>
      )}

      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AnnouncementIcon />}
                tooltip={collapsed}
              />
            )}

            {showExternalApi && (
              <>
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/messages-api"
                      primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                      icon={<CodeRoundedIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />
              </>
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<AccountTreeOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />

            {showIntegrations && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                    icon={<DeviceHubOutlined />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={<SyncAltIcon />}
                  showBadge={connectionWarning}
                  tooltip={collapsed}
                />
              )}
            />
            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={i18n.t("mainDrawer.listItems.allConnections")}
                icon={<PhonelinkSetup />}
                tooltip={collapsed}
              />
            )}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtmIcon />}
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/settings"
                  primary={i18n.t("mainDrawer.listItems.settings")}
                  icon={<SettingsOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />
            {user.super && (
              <>
                <ListItemLink
                  to="/companies"
                  primary={i18n.t("mainDrawer.listItems.companies")}
                  icon={<BusinessIcon />}
                  tooltip={collapsed}
                />
                {!collapsed && (
                  <Typography className={classes.versionContainer}>
                    Versão {displayVersion}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
