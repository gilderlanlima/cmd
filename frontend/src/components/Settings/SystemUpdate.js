import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { CloudDownload, CheckCircle, Refresh } from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    width: "100%",
  },
  sectionPaper: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  log: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.mode === "light" ? "#1e1e1e" : "#000",
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: 12,
    whiteSpace: "pre-wrap",
    maxHeight: 320,
    overflowY: "auto",
    borderRadius: theme.spacing(0.5),
  },
}));

const SystemUpdate = () => {
  const classes = useStyles();
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const pollRef = useRef(null);

  const handleCheck = async () => {
    setLoadingCheck(true);
    try {
      const { data } = await api.get("/system-update/check");
      setUpdateInfo(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Erro ao verificar atualizações"
      );
    }
    setLoadingCheck(false);
  };

  const pollStatus = () => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get("/system-update/status");
        setStatus(data);
        if (!data.running) {
          clearInterval(pollRef.current);
          handleCheck();
        }
      } catch (err) {
        clearInterval(pollRef.current);
      }
    }, 3000);
  };

  const handleApply = async () => {
    setConfirmOpen(false);
    try {
      await api.post("/system-update/apply");
      toast.success("Atualização iniciada. Isso pode reiniciar o sistema.");
      pollStatus();
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Erro ao iniciar atualização"
      );
    }
  };

  useEffect(() => {
    handleCheck();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={classes.container}>
      <Paper className={classes.sectionPaper} elevation={0}>
        <Box className={classes.header}>
          <Typography variant="h6">Atualizações do Sistema</Typography>
          {updateInfo && (
            <Chip
              icon={updateInfo.upToDate ? <CheckCircle /> : <CloudDownload />}
              label={
                updateInfo.upToDate
                  ? "Atualizado"
                  : `${updateInfo.pendingCommits.length} atualização(ões) disponível(is)`
              }
              color={updateInfo.upToDate ? "default" : "primary"}
            />
          )}
        </Box>

        <Typography variant="body2" color="textSecondary">
          Verifica o repositório no GitHub e permite atualizar o backend e o
          frontend para a versão mais recente da branch principal.
        </Typography>

        {updateInfo && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">
              Commit atual: {updateInfo.currentCommit?.slice(0, 7)}
              {!updateInfo.upToDate &&
                ` → mais recente: ${updateInfo.latestCommit?.slice(0, 7)}`}
            </Typography>
            {updateInfo.pendingCommits?.length > 0 && (
              <List dense>
                {updateInfo.pendingCommits.map((commit) => (
                  <ListItem key={commit} disableGutters>
                    <ListItemText primary={commit} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        <Box className={classes.actions}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleCheck}
            disabled={loadingCheck || status?.running}
          >
            Verificar atualizações
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={() => setConfirmOpen(true)}
            disabled={
              !updateInfo || updateInfo.upToDate || status?.running
            }
          >
            {status?.running ? "Atualizando..." : "Atualizar agora"}
          </Button>
        </Box>

        {status && (status.running || status.log) && (
          <Box className={classes.log}>{status.log || "Aguardando log..."}</Box>
        )}
      </Paper>

      <ConfirmationModal
        title="Atualizar sistema"
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={handleApply}
      >
        Isso vai baixar a versão mais recente do GitHub, reinstalar
        dependências, recompilar o backend e o frontend e reiniciar os
        serviços. O sistema pode ficar indisponível por alguns minutos.
        Deseja continuar?
      </ConfirmationModal>
    </Box>
  );
};

export default SystemUpdate;
