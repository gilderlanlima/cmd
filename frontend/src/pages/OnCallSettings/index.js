import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AlarmOnIcon from "@material-ui/icons/AlarmOn";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import ForbiddenPage from "../../components/ForbiddenPage";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getBackendUrl } from "../../config";
import noPicture from "../../assets/nopicture.png";

const backendUrl = getBackendUrl();

const DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const createDefaultSchedules = () =>
  DAYS.reduce((acc, day, index) => {
    acc[day.key] = {
      enabled: index < 5,
      start: "08:00",
      end: "18:00",
    };
    return acc;
  }, {});

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
  },
  rowAvatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 88,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    backgroundColor: "#E7F8EE",
    color: "#166534",
  },
  inactiveBadge: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
  },
  dialogContent: {
    overflowX: "hidden",
  },
  scheduleRow: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.25),
    borderRadius: 14,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.type === "dark" ? "#132238" : "#F8FBFF",
  },
  scheduleLabel: {
    fontWeight: 700,
  },
  helperBox: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    background: theme.palette.type === "dark" ? "#102038" : "#F5F8FD",
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const normalizeSchedules = (schedules) => {
  const defaults = createDefaultSchedules();

  if (!schedules || typeof schedules !== "object") {
    return defaults;
  }

  return DAYS.reduce((acc, day) => {
    acc[day.key] = {
      enabled: schedules?.[day.key]?.enabled ?? defaults[day.key].enabled,
      start: schedules?.[day.key]?.start || defaults[day.key].start,
      end: schedules?.[day.key]?.end || defaults[day.key].end,
    };
    return acc;
  }, {});
};

const formatPhone = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "-";
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
  }
  return digits;
};

const OnCallSettingModal = ({
  open,
  onClose,
  onSaved,
  users,
  setting,
}) => {
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    phone: "",
    intervalMinutes: 15,
    active: true,
    schedules: createDefaultSchedules(),
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      userId: setting?.userId || "",
      phone: setting?.phone || "",
      intervalMinutes: setting?.intervalMinutes || 15,
      active: setting?.active ?? true,
      schedules: normalizeSchedules(setting?.schedules),
    });
  }, [open, setting]);

  const handleScheduleChange = (dayKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dayKey]: {
          ...prev.schedules[dayKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    const hasValidDay = Object.values(form.schedules).some(
      (schedule) => schedule.enabled && schedule.start && schedule.end
    );

    if (!form.userId) {
      toast.error("Selecione um usuário para o plantão.");
      return;
    }

    if (!form.phone) {
      toast.error("Informe o telefone que receberá as notificações.");
      return;
    }

    if (!hasValidDay) {
      toast.error("Pelo menos um dia deve ter início e fim preenchidos.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        intervalMinutes: Number(form.intervalMinutes),
      };

      if (setting?.id) {
        await api.put(`/on-call-settings/${setting.id}`, payload);
        toast.success("Plantão atualizado com sucesso.");
      } else {
        await api.post("/on-call-settings", payload);
        toast.success("Plantão criado com sucesso.");
      }

      onSaved();
    } catch (error) {
      toastError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>{setting?.id ? "Editar plantão" : "Adicionar plantonista"}</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Usuário</InputLabel>
              <Select
                label="Usuário"
                value={form.userId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, userId: event.target.value }))
                }
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              label="Telefone"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              label="Intervalo entre notificações (min)"
              type="number"
              inputProps={{ min: 1, max: 1440 }}
              value={form.intervalMinutes}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  intervalMinutes: event.target.value,
                }))
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <div className={classes.helperBox}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Switch
                    checked={form.active}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, active: event.target.checked }))
                    }
                    color="primary"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2">
                    Ativar plantão para enviar notificações ao número configurado
                    quando novas conversas chegarem na plataforma.
                  </Typography>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" className={classes.scheduleLabel}>
              Dias da semana
            </Typography>
          </Grid>
          {DAYS.map((day) => (
            <Grid item xs={12} key={day.key}>
              <Grid container spacing={2} alignItems="center" className={classes.scheduleRow}>
                <Grid item xs={12} md={4}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Switch
                        checked={form.schedules[day.key].enabled}
                        onChange={(event) =>
                          handleScheduleChange(day.key, "enabled", event.target.checked)
                        }
                        color="primary"
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">{day.label}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    variant="outlined"
                    label="Início do plantão"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.schedules[day.key].start}
                    onChange={(event) =>
                      handleScheduleChange(day.key, "start", event.target.value)
                    }
                    disabled={!form.schedules[day.key].enabled}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    variant="outlined"
                    label="Fim do plantão"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.schedules[day.key].end}
                    onChange={(event) =>
                      handleScheduleChange(day.key, "end", event.target.value)
                    }
                    disabled={!form.schedules[day.key].enabled}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined" disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AlarmOnIcon />}
        >
          {setting?.id ? "Salvar" : "Adicionar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const OnCallSettings = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingSetting, setDeletingSetting] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsResponse, usersResponse] = await Promise.all([
        api.get("/on-call-settings"),
        api.get("/users/list"),
      ]);

      setSettings(settingsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = () => {
    setModalOpen(false);
    setSelectedSetting(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingSetting?.id) return;
    try {
      await api.delete(`/on-call-settings/${deletingSetting.id}`);
      toast.success("Plantão removido com sucesso.");
      setConfirmOpen(false);
      setDeletingSetting(null);
      loadData();
    } catch (error) {
      toastError(error);
    }
  };

  const activeDaysLabel = useMemo(
    () => (schedules) =>
      DAYS.filter((day) => schedules?.[day.key]?.enabled)
        .map((day) => day.label)
        .join(", ") || "Nenhum dia ativo",
    []
  );

  const buildAvatar = (setting) => {
    const profileImage = setting?.user?.profileImage;
    const companyId = setting?.user?.companyId || user.companyId;

    if (!profileImage) {
      return noPicture;
    }

    return `${backendUrl}/public/company${companyId}/user/${profileImage}`;
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingSetting ? `Remover plantão de ${deletingSetting.user?.name}?` : "Remover plantão"}
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeletingSetting(null);
        }}
        onConfirm={handleDelete}
      >
        Esta ação remove a configuração de plantão e interrompe novos avisos para esse usuário.
      </ConfirmationModal>

      <OnCallSettingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSetting(null);
        }}
        onSaved={handleSaved}
        users={users}
        setting={selectedSetting}
      />

      <MainHeader>
        <Title>Plantão ({settings.length})</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedSetting(null);
              setModalOpen(true);
            }}
          >
            Adicionar plantonista
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {loading ? (
          <Grid container justifyContent="center" style={{ padding: 32 }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Status</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell align="center">Intervalo</TableCell>
                <TableCell>Dias ativos</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum plantão configurado até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell align="center">
                      <span
                        className={`${classes.statusBadge} ${
                          !setting.active ? classes.inactiveBadge : ""
                        }`}
                      >
                        {setting.active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Avatar
                            src={buildAvatar(setting)}
                            className={classes.rowAvatar}
                            alt={setting.user?.name}
                          />
                        </Grid>
                        <Grid item>
                          <Typography variant="body2" style={{ fontWeight: 700 }}>
                            {setting.user?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {setting.user?.email}
                          </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell>{formatPhone(setting.phone)}</TableCell>
                    <TableCell align="center">
                      {setting.intervalMinutes} min
                    </TableCell>
                    <TableCell>{activeDaysLabel(setting.schedules)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedSetting(setting);
                          setModalOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeletingSetting(setting);
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </MainContainer>
  );
};

export default OnCallSettings;
