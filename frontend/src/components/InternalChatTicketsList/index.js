import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { useHistory, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/Auth/AuthContext";
import UserStatusIcon from "../UserModal/statusIcon";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    background: theme.palette.background.paper,
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(1),
    padding: theme.spacing(0.5, 1.25),
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    backgroundColor: theme.palette.background.paper,
  },
  searchIcon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  searchInput: {
    flex: 1,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStyles,
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  listItem: {
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  listItemActive: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor:
      theme.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  userNameRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  secondary: {
    color: theme.palette.text.secondary,
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const InternalChatTicketsList = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeChatUuid = query.get("chatUuid");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [usersResponse, chatsResponse] = await Promise.all([
          api.get("/users/list"),
          api.get("/chats"),
        ]);

        if (!mounted) {
          return;
        }

        setUsers(
          (usersResponse.data || []).filter((listedUser) => listedUser.id !== user.id)
        );
        setChats(chatsResponse.data?.records || []);
      } catch (error) {
        console.error("Erro ao carregar lista do chat interno:", error);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [user.id]);

  const directChatForUser = (targetUserId) =>
    chats.find((chat) => {
      const isDirect = !chat.isGroup && chat.users?.length === 2;
      const includesTarget = chat.users?.some((chatUser) => chatUser.userId === targetUserId);
      const includesLogged = chat.users?.some((chatUser) => chatUser.userId === user.id);

      return isDirect && includesTarget && includesLogged;
    });

  const openChat = async (listedUser) => {
    try {
      let directChat = directChatForUser(listedUser.id);

      if (!directChat) {
        const response = await api.post("/chats", {
          users: [{ id: listedUser.id }],
          isGroup: false,
        });

        directChat = response.data;
        setChats((prevState) => {
          const withoutSameChat = prevState.filter((chat) => chat.id !== directChat.id);
          return [directChat, ...withoutSameChat];
        });
      }

      const nextParams = new URLSearchParams(location.search);
      nextParams.set("tab", "chat-internal");
      nextParams.set("chatUuid", directChat.uuid);
      history.replace(`/tickets?${nextParams.toString()}`);
    } catch (error) {
      console.error("Erro ao abrir chat interno:", error);
    }
  };

  const visibleUsers = users.filter((listedUser) =>
    listedUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper square elevation={0} className={classes.root}>
      <div className={classes.searchWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Procurar chat..."
          className={classes.searchInput}
        />
      </div>

      <List className={classes.list}>
        {visibleUsers.map((listedUser) => {
          const directChat = directChatForUser(listedUser.id);
          const isActive = directChat?.uuid === activeChatUuid;

          return (
            <ListItem
              button
              key={listedUser.id}
              onClick={() => openChat(listedUser)}
              className={isActive ? classes.listItemActive : classes.listItem}
            >
              <ListItemAvatar>
                <Avatar
                  src={
                    listedUser.profileImage
                      ? listedUser.profileImage.startsWith("http")
                        ? listedUser.profileImage
                        : `${getBackendUrl()}/public/company${listedUser.companyId}/user/${listedUser.profileImage}`
                      : undefined
                  }
                >
                  {listedUser.name?.charAt(0) || "U"}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <div className={classes.userNameRow}>
                    <Typography variant="subtitle1">{listedUser.name}</Typography>
                    <UserStatusIcon user={listedUser} />
                  </div>
                }
                secondary={
                  <Typography variant="body2" className={classes.secondary}>
                    {directChat?.lastMessage?.message || listedUser.email || "Iniciar conversa"}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}

        {visibleUsers.length === 0 && (
          <div className={classes.emptyState}>
            <Typography variant="body2">
              Nenhum usuario disponivel para o chat interno.
            </Typography>
          </div>
        )}
      </List>
    </Paper>
  );
};

export default InternalChatTicketsList;
