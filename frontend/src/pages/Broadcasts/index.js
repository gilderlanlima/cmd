import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Button,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  makeStyles
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";
import BroadcastModal from "../../components/BroadcastModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  }
}));

const reducer = (state, action) => {
  if (action.type === "LOAD") {
    return action.payload;
  }

  if (action.type === "UPSERT") {
    const index = state.findIndex(item => item.id === action.payload.id);
    if (index !== -1) {
      const clone = [...state];
      clone[index] = action.payload;
      return clone;
    }
    return [action.payload, ...state];
  }

  if (action.type === "DELETE") {
    return state.filter(item => item.id !== action.payload);
  }

  return state;
};

const Broadcasts = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [records, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const isAdmin = user?.profile === "admin";

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/campaigns", {
        params: {
          searchParam,
          pageNumber: 1,
          pageSize: 100,
          dispatchMode: "broadcast"
        }
      });
      dispatch({ type: "LOAD", payload: data.records || [] });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBroadcasts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParam]);

  const handleDelete = async id => {
    try {
      await api.delete(`/campaigns/${id}`);
      dispatch({ type: "DELETE", payload: id });
      toast.success("Lista de transmissão removida");
    } catch (err) {
      toastError(err);
    }
    setDeletingId(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Excluir lista de transmissão"
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => handleDelete(deletingId)}
      >
        Essa ação remove a lista de transmissão selecionada.
      </ConfirmationModal>

      <BroadcastModal
        open={modalOpen}
        onClose={() => {
          setSelectedBroadcast(null);
          setModalOpen(false);
        }}
        broadcastId={selectedBroadcast}
        onSave={fetchBroadcasts}
      />

      <MainHeader>
        <Title>Lista de transmissão</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedBroadcast(null);
              setModalOpen(true);
            }}
          >
            Nova transmissão
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <TextField
          placeholder="Buscar transmissões"
          variant="outlined"
          margin="dense"
          fullWidth
          value={searchParam}
          onChange={event => setSearchParam(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Agendamento</TableCell>
              {isAdmin && <TableCell align="right">Excluir</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={isAdmin ? 4 : 3} />
            ) : (
              records.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>
                    {record.scheduledAt
                      ? new Date(record.scheduledAt).toLocaleString("pt-BR")
                      : "-"}
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Button
                        color="secondary"
                        size="small"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => setDeletingId(record.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Broadcasts;
