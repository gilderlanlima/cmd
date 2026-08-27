import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  CloudDownload,
  CheckCircle,
  Refresh,
  History,
  Warning,
} from "@material-ui/icons";
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
  downgradeSection: {
    marginTop: theme.spacing(3),
  },
  downgradeHeading: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
    marginBottom: theme.spacing(1.5),
  },
  downgradeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
  warningBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 10,
    backgroundColor: theme.palette.type === "dark" ? "rgba(245,158,11,0.12)" : "#FFF7E6",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(245,158,11,0.3)" : "#FCE3A6"}`,
    marginTop: theme.spacing(2),
  },
}));

const SystemUpdate = () => {
  const classes = useStyles();
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [pendingTarget, setPendingTarget] = useState(null);
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
    if (!pendingTarget) return;
    const { tag } = pendingTarget;
    setPendingTarget(null);
    try {
      await api.post("/system-update/apply", { targetTag: tag });
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
                  : `Versão ${updateInfo.latestVersion} disponível`
              }
              color={updateInfo.upToDate ? "default" : "primary"}
            />
          )}
        </Box>

        <Typography variant="body2" color="textSecondary">
          Verifica se há uma nova versão do sistema e permite atualizar o
          backend e o frontend automaticamente.
        </Typography>

        {updateInfo && (
          <Box mt={2}>
            <Typography variant="body2">
              {updateInfo.upToDate ? (
                <>Você está usando a versão mais recente: <strong>{updateInfo.currentVersion}</strong></>
              ) : (
                <>
                  Versão atual: <strong>{updateInfo.currentVersion}</strong>
                  {" — "}
                  Nova versão: <strong>{updateInfo.latestVersion}</strong>
                </>
              )}
            </Typography>
            {updateInfo.changes?.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ display: "block", marginTop: 8 }}
                >
                  O que vai mudar:
                </Typography>
                <List dense>
                  {updateInfo.changes.map((change) => (
                    <ListItem key={change} disableGutters>
                      <ListItemText primary={change} />
                    </ListItem>
                  ))}
                </List>
              </>
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
            onClick={() =>
              setPendingTarget({
                type: "upgrade",
                tag: updateInfo.latestTag,
                version: updateInfo.latestVersion,
              })
            }
            disabled={
              !updateInfo || !updateInfo.latestTag || updateInfo.upToDate || status?.running
            }
          >
            {status?.running ? "Atualizando..." : "Atualizar agora"}
          </Button>
        </Box>

        {updateInfo?.downgradeOptions?.length > 0 && (
          <Box className={classes.downgradeSection}>
            <Divider style={{ marginBottom: 16 }} />
            <Typography variant="subtitle2" className={classes.downgradeHeading}>
              <History fontSize="small" color="action" />
              Reverter para uma versão anterior
            </Typography>
            {updateInfo.downgradeOptions.map((option) => (
              <div key={option.tag} className={classes.downgradeRow}>
                <Typography variant="body2">
                  Versão <strong>{option.version}</strong>
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setPendingTarget({
                      type: "downgrade",
                      tag: option.tag,
                      version: option.version,
                    })
                  }
                  disabled={status?.running}
                >
                  Reverter
                </Button>
              </div>
            ))}
          </Box>
        )}

        {status && (status.running || status.log) && (
          <Box className={classes.log}>{status.log || "Aguardando log..."}</Box>
        )}
      </Paper>

      <ConfirmationModal
        title={
          pendingTarget?.type === "downgrade"
            ? `Reverter para a versão ${pendingTarget?.version}`
            : "Atualizar sistema"
        }
        open={Boolean(pendingTarget)}
        onClose={() => setPendingTarget(null)}
        onConfirm={handleApply}
      >
        {pendingTarget?.type === "downgrade" ? (
          <>
            Isso vai reinstalar dependências, recompilar o backend e o
            frontend e reiniciar os serviços na versão {pendingTarget?.version}.
            O sistema pode ficar indisponível por alguns minutos.
            <Box className={classes.warningBox}>
              <Warning fontSize="small" style={{ color: "#B45309" }} />
              <Typography variant="body2">
                Reverter o código não desfaz alterações já aplicadas no
                banco de dados por versões mais novas. Se a versão atual
                incluiu migrações de banco, elas continuarão em vigor.
              </Typography>
            </Box>
          </>
        ) : (
          <>
            Isso vai instalar a versão {pendingTarget?.version}, reinstalar
            dependências, recompilar o backend e o frontend e reiniciar os
            serviços. O sistema pode ficar indisponível por alguns minutos.
            Deseja continuar?
          </>
        )}
      </ConfirmationModal>
    </Box>
  );
};

export default SystemUpdate;
