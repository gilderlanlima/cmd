import React, { useContext, useEffect, useMemo, useReducer, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import EditIcon from "@material-ui/icons/Edit";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import { makeStyles } from "@material-ui/core/styles";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import OnDutyModal from "../../components/OnDutyModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import useWhatsApps from "../../hooks/useWhatsApps";
import ForbiddenPage from "../../components/ForbiddenPage";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach(user => {
      const userIndex = state.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    }

    return [user, ...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  helperText: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary
  }
}));

const OnDuty = () => {
  const classes = useStyles();
  const { user: loggedInUser, socket } = useContext(AuthContext);
  const { whatsApps } = useWhatsApps();
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, [searchParam]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/users", {
          params: { searchParam, pageNumber: 1 }
        });
        dispatch({ type: "LOAD_USERS", payload: data.users || [] });
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchParam]);

  useEffect(() => {
    if (!loggedInUser || !socket) {
      return undefined;
    }

    const companyId = loggedInUser.companyId;
    const onCompanyUser = data => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }
    };

    socket.on(`company-${companyId}-user`, onCompanyUser);

    return () => {
      socket.off(`company-${companyId}-user`, onCompanyUser);
    };
  }, [loggedInUser, socket]);

  const whatsappNames = useMemo(() => {
    return whatsApps.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  }, [whatsApps]);

  const configuredUsers = useMemo(() => {
    return users.filter(user => Boolean(user.followMeEnabled));
  }, [users]);

  const handleOpenModal = user => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const formatConnectionName = user => {
    if (!user.followMeWhatsappId) {
      return "Todas as conexões";
    }

    return whatsappNames[user.followMeWhatsappId] || `Conexão #${user.followMeWhatsappId}`;
  };

  if (loggedInUser.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <MainContainer>
      <OnDutyModal
        open={modalOpen}
        onClose={handleCloseModal}
        userId={selectedUser?.id}
        users={users}
      />

      <MainHeader>
        <Title>Plantão ({configuredUsers.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Pesquisar membro da equipe..."
            type="search"
            value={searchParam}
            onChange={event => setSearchParam(event.target.value.toLowerCase())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateModal}
          >
            Incluir plantão
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Typography variant="body2" className={classes.helperText}>
        Configure quem ficará de plantão e em qual número pessoal receberá o alerta de novos tickets.
      </Typography>

      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell>Equipe</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Telefone pessoal</TableCell>
              <TableCell>Conexão</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <>
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
              </>
            ) : (
              configuredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell align="center">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={user.followMeEnabled ? "Ativo" : "Inativo"}
                      style={{
                        backgroundColor: user.followMeEnabled ? "#dcfce7" : "#e5e7eb",
                        color: user.followMeEnabled ? "#166534" : "#4b5563",
                        fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.followMePhone || "Não definido"}</TableCell>
                  <TableCell>{formatConnectionName(user)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenModal(user)}>
                      <AccessTimeIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenModal(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && configuredUsers.length === 0 && (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <Typography variant="body2" color="textSecondary">
              Nenhum plantão configurado ainda.
            </Typography>
          </div>
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
            <CircularProgress size={24} />
          </div>
        )}
      </Paper>
    </MainContainer>
  );
};

export default OnDuty;
