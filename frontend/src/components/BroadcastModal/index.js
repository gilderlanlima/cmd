import React, { useEffect, useMemo, useState } from "react";
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
  makeStyles
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { TextField as FormikTextField } from "formik-material-ui";
import api from "../../services/api";
import toastError from "../../errors/toastError";

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

const BroadcastSchema = Yup.object()
  .shape({
    name: Yup.string().min(2).max(80).required(),
    scheduledAt: Yup.string().required(),
    whatsappId: Yup.number().required(),
    tagListId: Yup.string().nullable(),
    message1: Yup.string().required("Informe a mensagem")
  })
  .test("tag-required", "Selecione uma tag", values => Boolean(values.tagListId));

const BroadcastModal = ({ open, onClose, broadcastId, onSave }) => {
  const classes = useStyles();
  const [tagLists, setTagLists] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialState = useMemo(
    () => ({
      name: "",
      scheduledAt: "",
      whatsappId: "",
      contactListId: "",
      tagListId: "",
      message1: "",
      openTicket: "enabled",
      statusTicket: "closed"
    }),
    []
  );

  const [broadcast, setBroadcast] = useState(initialState);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadDependencies = async () => {
      try {
        const [tagsResponse, whatsappResponse] = await Promise.all([
          api.get("/tags/list", { params: { kanban: 0 } }),
          api.get("/whatsapp", { params: { session: 0 } })
        ]);

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
          contactListId: "",
          tagListId: data.tagListId ? String(data.tagListId) : "",
          message1: data.message1 || "",
          openTicket: "enabled",
          statusTicket: "closed"
        });
      } catch (err) {
        toastError(err);
      }
    };

    loadBroadcast();
  }, [broadcastId, initialState, open]);

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
      openTicket: "enabled",
      statusTicket: "closed",
      contactListId: null,
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
                    <InputLabel id="broadcast-tag-list-label">Tag</InputLabel>
                    <Field
                      as={Select}
                      labelId="broadcast-tag-list-label"
                      label="Tag"
                      name="tagListId"
                      value={values.tagListId}
                      onChange={event => setFieldValue("tagListId", event.target.value)}
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
