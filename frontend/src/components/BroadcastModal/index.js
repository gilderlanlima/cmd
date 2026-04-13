import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  TextField,
  makeStyles
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { TextField as FormikTextField } from "formik-material-ui";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  btnWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const BroadcastSchema = Yup.object().shape({
  name: Yup.string().min(2).max(80).required(),
  scheduledAt: Yup.string().required(),
  whatsappId: Yup.number().required(),
  contactListId: Yup.number().nullable(),
  tagListId: Yup.string().nullable(),
  message1: Yup.string().required("Informe a mensagem"),
  openTicket: Yup.string().required(),
  statusTicket: Yup.string().required()
}).test(
  "origin-required",
  "Selecione uma lista de contatos ou uma tag",
  values => Boolean(values.contactListId || values.tagListId)
);

const BroadcastModal = ({ open, onClose, broadcastId, onSave }) => {
  const classes = useStyles();
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialState = {
    name: "",
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "",
    message1: "",
    openTicket: "disabled",
    statusTicket: "open"
  };

  const [broadcast, setBroadcast] = useState(initialState);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadDependencies = async () => {
      try {
        const [contactListsResponse, tagsResponse, whatsappResponse] = await Promise.all([
          api.get("/contact-lists/list"),
          api.get("/tags/list", { params: { kanban: 0 } }),
          api.get("/whatsapp", { params: { session: 0 } })
        ]);

        setContactLists(contactListsResponse.data || []);
        setWhatsapps(whatsappResponse.data || []);
        setTagLists(
          (tagsResponse.data || [])
            .filter(tag => Array.isArray(tag.contacts) && tag.contacts.length > 0)
            .map(tag => ({
              id: String(tag.id),
              name: `${tag.name} (${tag.contacts.length})`
            }))
        );
      } catch (err) {
        toastError(err);
      }
    };

    loadDependencies();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setBroadcast(initialState);
      return;
    }

    if (!broadcastId) {
      setBroadcast(initialState);
      return;
    }

    const loadBroadcast = async () => {
      try {
        const { data } = await api.get(`/campaigns/${broadcastId}`);
        setBroadcast({
          name: data.name || "",
          scheduledAt: data.scheduledAt ? String(data.scheduledAt).slice(0, 16) : "",
          whatsappId: data.whatsappId || "",
          contactListId: data.contactListId || "",
          tagListId: data.tagListId ? String(data.tagListId) : "",
          message1: data.message1 || "",
          openTicket: data.openTicket || "disabled",
          statusTicket: data.statusTicket || "open"
        });
      } catch (err) {
        toastError(err);
      }
    };

    loadBroadcast();
  }, [broadcastId, open]);

  const handleSubmit = async values => {
    setLoading(true);

    const payload = {
      ...values,
      dispatchMode: "broadcast",
      confirmation: false,
      message2: "",
      message3: "",
      message4: "",
      message5: "",
      confirmationMessage1: "",
      confirmationMessage2: "",
      confirmationMessage3: "",
      confirmationMessage4: "",
      confirmationMessage5: "",
      contactListId: values.contactListId || null,
      tagListId: values.tagListId || null
    };

    try {
      if (broadcastId) {
        await api.put(`/campaigns/${broadcastId}`, payload);
      } else {
        await api.post("/campaigns", payload);
      }

      toast.success(
        broadcastId ? "Lista de transmissão atualizada" : "Lista de transmissão criada"
      );

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>
        {broadcastId ? "Editar lista de transmissão" : "Nova lista de transmissão"}
      </DialogTitle>
      <Formik
        initialValues={broadcast}
        enableReinitialize
        validationSchema={BroadcastSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    component={FormikTextField}
                    name="name"
                    label="Nome"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    component={FormikTextField}
                    name="scheduledAt"
                    label="Data e hora"
                    type="datetime-local"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="broadcast-whatsapp-label">Conexão</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-whatsapp-label"
                      label="Conexão"
                      name="whatsappId"
                    >
                      {whatsapps.map(whatsapp => (
                        <MenuItem key={whatsapp.id} value={whatsapp.id}>
                          {whatsapp.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="broadcast-contact-list-label">Lista de contatos</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-contact-list-label"
                      label="Lista de contatos"
                      name="contactListId"
                      value={values.contactListId}
                      onChange={event => {
                        setFieldValue("contactListId", event.target.value);
                        if (event.target.value) {
                          setFieldValue("tagListId", "");
                        }
                      }}
                    >
                      <MenuItem value="">Nenhuma</MenuItem>
                      {contactLists.map(contactList => (
                        <MenuItem key={contactList.id} value={contactList.id}>
                          {contactList.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="broadcast-tag-list-label">Tag</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-tag-list-label"
                      label="Tag"
                      name="tagListId"
                      value={values.tagListId}
                      onChange={event => {
                        setFieldValue("tagListId", event.target.value);
                        if (event.target.value) {
                          setFieldValue("contactListId", "");
                        }
                      }}
                    >
                      <MenuItem value="">Nenhuma</MenuItem>
                      {tagLists.map(tag => (
                        <MenuItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="broadcast-open-ticket-label">Abrir ticket</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-open-ticket-label"
                      label="Abrir ticket"
                      name="openTicket"
                    >
                      <MenuItem value="disabled">Não</MenuItem>
                      <MenuItem value="enabled">Sim</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" fullWidth disabled={values.openTicket !== "enabled"}>
                    <InputLabel id="broadcast-status-ticket-label">Status do ticket</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-status-ticket-label"
                      label="Status do ticket"
                      name="statusTicket"
                    >
                      <MenuItem value="open">{i18n.t("tickets.tabs.open.title")}</MenuItem>
                      <MenuItem value="pending">{i18n.t("tickets.tabs.pending.title")}</MenuItem>
                      <MenuItem value="closed">{i18n.t("tickets.tabs.closed.title")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    component={FormikTextField}
                    name="message1"
                    label="Mensagem única"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={6}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    value="A lista de transmissão envia somente uma mensagem por contato. Use uma lista de contatos ou uma tag."
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary" disabled={loading}>
                Cancelar
              </Button>
              <div className={classes.btnWrapper}>
                <Button type="submit" color="primary" variant="contained" disabled={loading}>
                  Salvar
                </Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default BroadcastModal;
