import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
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
import AlarmOnOutlinedIcon from "@material-ui/icons/AlarmOnOutlined";
import PersonOutlineOutlinedIcon from "@material-ui/icons/PersonOutlineOutlined";
import NotificationsActiveOutlinedIcon from "@material-ui/icons/NotificationsActiveOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";

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
    padding: theme.spacing(3),
  },
  dialogHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  dialogHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.type === "dark" ? "rgba(99,102,241,0.18)" : "rgba(79,70,229,0.1)",
    color: theme.palette.primary.main,
    flexShrink: 0,
  },
  dialogHeaderTitle: {
    fontWeight: 800,
    lineHeight: 1.3,
  },
  dialogHeaderSubtitle: {
    marginTop: 2,
  },
  sectionCard: {
    padding: theme.spacing(2.5),
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2.5),
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  toggleCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 14,
    background: theme.palette.type === "dark" ? "rgba(99,102,241,0.1)" : "rgba(79,70,229,0.06)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(99,102,241,0.25)" : "rgba(79,70,229,0.15)"}`,
  },
  toggleCardIcon: {
    color: theme.palette.primary.main,
    display: "flex",
  },
  toggleCardText: {
    flex: 1,
  },
  daysCountChip: {
    fontWeight: 600,
  },
  scheduleRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.25),
    padding: theme.spacing(1.5, 2),
    borderRadius: 14,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.type === "dark" ? "#132238" : "#F8FBFF",
    transition: "opacity 0.15s ease",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  scheduleRowDisabled: {
    opacity: 0.55,
  },
  scheduleDayLabel: {
    display: "flex",
    alignItems: "center",
    minWidth: 190,
    flexShrink: 0,
  },
  scheduleLabel: {
    fontWeight: 700,
  },
  scheduleTimes: {
    display: "flex",
    flex: 1,
    gap: theme.spacing(2),
    flexWrap: "wrap",
    minWidth: 240,
  },
  scheduleTimeField: {
    flex: 1,
    minWidth: 130,
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

  const activeDaysCount = Object.values(form.schedules).filter((s) => s.enabled).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <div className={classes.dialogHeader}>
        <div className={classes.dialogHeaderIcon}>
          <AlarmOnOutlinedIcon />
        </div>
        <div>
          <Typography variant="h6" className={classes.dialogHeaderTitle}>
            {setting?.id ? "Editar plantão" : "Adicionar plantonista"}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            className={classes.dialogHeaderSubtitle}
          >
            Configure quem recebe notificações e em quais horários o plantão fica ativo.
          </Typography>
        </div>
      </div>
      <DialogContent className={classes.dialogContent}>
        <div className={classes.sectionCard}>
          <Typography variant="subtitle1" className={classes.sectionHeading}>
            <PersonOutlineOutlinedIcon fontSize="small" color="primary" />
            Dados do plantonista
          </Typography>
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
          </Grid>

          <Box mt={2.5}>
            <div className={classes.toggleCard}>
              <div className={classes.toggleCardIcon}>
                <NotificationsActiveOutlinedIcon />
              </div>
              <div className={classes.toggleCardText}>
                <Typography variant="body2" style={{ fontWeight: 700 }}>
                  Plantão ativo
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Envia notificações ao número configurado quando novas conversas chegarem.
                </Typography>
              </div>
              <Switch
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
                color="primary"
              />
            </div>
          </Box>
        </div>

        <div className={classes.sectionCard}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle1" className={classes.sectionHeading} style={{ marginBottom: 0 }}>
              <EventNoteOutlinedIcon fontSize="small" color="primary" />
              Dias da semana
            </Typography>
            <Typography variant="caption" color="textSecondary" className={classes.daysCountChip}>
              {activeDaysCount} de {DAYS.length} dias ativos
            </Typography>
          </Box>

          {DAYS.map((day) => {
            const daySchedule = form.schedules[day.key];
            return (
              <div
                key={day.key}
                className={`${classes.scheduleRow} ${
                  !daySchedule.enabled ? classes.scheduleRowDisabled : ""
                }`}
              >
                <div className={classes.scheduleDayLabel}>
                  <Switch
                    checked={daySchedule.enabled}
                    onChange={(event) =>
                      handleScheduleChange(day.key, "enabled", event.target.checked)
                    }
                    color="primary"
                  />
                  <Typography variant="body2" className={classes.scheduleLabel}>
                    {day.label}
                  </Typography>
                </div>
                <div className={classes.scheduleTimes}>
                  <TextField
                    variant="outlined"
                    label="Início"
                    type="time"
                    size="small"
                    className={classes.scheduleTimeField}
                    InputLabelProps={{ shrink: true }}
                    value={daySchedule.start}
                    onChange={(event) =>
                      handleScheduleChange(day.key, "start", event.target.value)
                    }
                    disabled={!daySchedule.enabled}
                  />
                  <TextField
                    variant="outlined"
                    label="Fim"
                    type="time"
                    size="small"
                    className={classes.scheduleTimeField}
                    InputLabelProps={{ shrink: true }}
                    value={daySchedule.end}
                    onChange={(event) =>
                      handleScheduleChange(day.key, "end", event.target.value)
                    }
                    disabled={!daySchedule.enabled}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
      <Divider />
      <DialogActions style={{ padding: 16 }}>
        <Button onClick={onClose} color="secondary" variant="outlined" disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AlarmOnOutlinedIcon />}
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
