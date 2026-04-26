import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import {
  WORKING_DAYS,
  createDefaultFollowMeSchedule,
  normalizeFollowMeSchedule
} from "../../utils/followMeSchedule";

const useStyles = makeStyles(theme => ({
  dialogPaper: {
    borderRadius: 16,
  },
  dialogTitle: {
    padding: theme.spacing(2, 3, 1.25),
    "& .MuiTypography-root": {
      fontSize: "1.1rem",
      fontWeight: 700,
    }
  },
  dialogContent: {
    padding: theme.spacing(1.5, 3, 2),
  },
  dialogActions: {
    padding: theme.spacing(1.25, 3, 2),
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
    fontSize: "0.95rem",
  },
  sectionDescription: {
    marginBottom: theme.spacing(1.25),
    lineHeight: 1.45,
  },
  compactSwitch: {
    marginLeft: 0,
    marginRight: 0,
  },
  dayCard: {
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: "none"
  },
  dayLabel: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  }
}));

const schema = Yup.object().shape({
  followMePhone: Yup.string().nullable()
});

const initialState = {
  id: null,
  name: "",
  followMeEnabled: true,
  followMePhone: "",
  followMeWhatsappId: "",
  followMeSchedule: createDefaultFollowMeSchedule()
};

const OnDutyModal = ({ open, onClose, userId, users = [] }) => {
  const classes = useStyles();
  const { whatsApps } = useWhatsApps();
  const [user, setUser] = useState(initialState);
  const [selectedUserId, setSelectedUserId] = useState(userId || "");

  useEffect(() => {
    setSelectedUserId(userId || "");
  }, [userId, open]);

  useEffect(() => {
    const loadUser = async () => {
      if (!open || !selectedUserId) {
        setUser(initialState);
        return;
      }

      try {
        const { data } = await api.get(`/users/${selectedUserId}`);
        const normalizedPhone = String(data.followMePhone || "").replace(/^55/, "");

        setUser({
          id: data.id,
          name: data.name,
          followMeEnabled: Boolean(data.followMeEnabled),
          followMePhone: normalizedPhone,
          followMeWhatsappId: data.followMeWhatsappId || "",
          followMeSchedule: normalizeFollowMeSchedule(data.followMeSchedule)
        });
      } catch (err) {
        toastError(err);
      }
    };

    loadUser();
  }, [open, selectedUserId]);

  const handleClose = () => {
    setUser(initialState);
    setSelectedUserId(userId || "");
    onClose();
  };

  const handleSubmit = async values => {
    try {
      if (!selectedUserId) {
        toast.error("Selecione o membro da equipe.");
        return;
      }

      await api.put(`/users/${selectedUserId}/follow-me`, {
        followMeEnabled: Boolean(values.followMeEnabled),
        followMePhone: String(values.followMePhone || "").replace(/\D/g, ""),
        followMeWhatsappId: values.followMeWhatsappId || null,
        followMeSchedule: values.followMeSchedule
      });

      toast.success("Plantão atualizado com sucesso.");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {user?.name ? `Plantão de ${user.name}` : "Novo plantão"}
      </DialogTitle>
      <Formik
        initialValues={user}
        enableReinitialize
        validationSchema={schema}
        onSubmit={async (values, actions) => {
          await handleSubmit(values);
          actions.setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <DialogContent dividers className={classes.dialogContent}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Configuração de plantão
              </Typography>
              <Typography variant="body2" color="textSecondary" className={classes.sectionDescription}>
                Defina em qual número pessoal o membro da equipe será avisado quando entrarem novas mensagens no período de plantão.
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FormControl
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    size="small"
                  >
                    <InputLabel>Membro da equipe</InputLabel>
                    <Select
                      value={selectedUserId}
                      onChange={event => setSelectedUserId(event.target.value)}
                      label="Membro da equipe"
                      disabled={Boolean(userId)}
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {users.map(option => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    className={classes.compactSwitch}
                    control={(
                      <Switch
                        color="primary"
                        checked={Boolean(values.followMeEnabled)}
                        onChange={event => setFieldValue("followMeEnabled", event.target.checked)}
                      />
                    )}
                    label="Ativar plantão"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    size="small"
                  >
                    <InputLabel>Conexão do plantão</InputLabel>
                    <Field
                      as={Select}
                      name="followMeWhatsappId"
                      label="Conexão do plantão"
                      disabled={!values.followMeEnabled}
                    >
                      <MenuItem value={""}>Todas as conexões</MenuItem>
                      {whatsApps.map(whatsapp => (
                        <MenuItem key={whatsapp.id} value={whatsapp.id}>
                          {whatsapp.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Field
                    as={TextField}
                    label="Telefone pessoal"
                    name="followMePhone"
                    variant="outlined"
                    margin="dense"
                    size="small"
                    fullWidth
                    disabled={!values.followMeEnabled}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+55</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                {WORKING_DAYS.map(day => (
                  <Grid item xs={12} key={`followMe-${day.key}`}>
                    <Paper className={classes.dayCard}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <FormControlLabel
                            className={classes.compactSwitch}
                            control={(
                              <Switch
                                color="primary"
                                checked={Boolean(values.followMeSchedule?.[day.key]?.enabled)}
                                onChange={event =>
                                  setFieldValue(`followMeSchedule.${day.key}.enabled`, event.target.checked)
                                }
                                disabled={!values.followMeEnabled}
                              />
                            )}
                            label={<span className={classes.dayLabel}>{day.label}</span>}
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <Field
                            as={TextField}
                            label="Início"
                            type="time"
                            name={`followMeSchedule.${day.key}.start`}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 600 }}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            size="small"
                            disabled={!values.followMeEnabled || !values.followMeSchedule?.[day.key]?.enabled}
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <Field
                            as={TextField}
                            label="Fim"
                            type="time"
                            name={`followMeSchedule.${day.key}.end`}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 600 }}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            size="small"
                            disabled={!values.followMeEnabled || !values.followMeSchedule?.[day.key]?.enabled}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={isSubmitting}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
                variant="contained"
                className={classes.btnWrapper}
              >
                Salvar
                {isSubmitting && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default OnDutyModal;
