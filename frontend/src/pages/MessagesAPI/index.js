import React, { useState, useEffect, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import axios from "axios";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  pageRoot: {
    flex: 1,
    padding: theme.spacing(2),
    background:
      "radial-gradient(circle at 15% 10%, rgba(55,211,244,0.18), transparent 24%), radial-gradient(circle at 90% 80%, rgba(47,111,237,0.16), transparent 26%), linear-gradient(180deg, #f6f9ff 0%, #edf4ff 100%)",
    minHeight: "calc(100vh - 96px)",
    borderRadius: 16,
  },
  heroCard: {
    borderRadius: 18,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: "#fff",
    background:
      "linear-gradient(130deg, #12325f 0%, #1d4ed8 55%, #37d3f4 100%)",
    boxShadow: "0 16px 34px rgba(20, 52, 101, 0.25)",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: theme.spacing(1),
    letterSpacing: "-0.02em",
  },
  heroSubtitle: {
    opacity: 0.9,
    lineHeight: 1.6,
    maxWidth: 900,
  },
  chipRow: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.24)",
    fontWeight: 600,
  },
  sectionCard: {
    borderRadius: 16,
    border: "1px solid rgba(18,50,95,0.08)",
    boxShadow: "0 10px 24px rgba(12, 35, 66, 0.08)",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: theme.spacing(2, 2.5),
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    background: "linear-gradient(180deg, #ffffff, #f8fbff)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#153760",
  },
  sectionDescription: {
    marginTop: theme.spacing(0.5),
    color: "#5f6f83",
    lineHeight: 1.6,
  },
  sectionBody: {
    padding: theme.spacing(2.5),
    backgroundColor: "#ffffff",
  },
  tabsRoot: {
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    marginBottom: theme.spacing(2),
  },
  tabRoot: {
    textTransform: "none",
    fontWeight: 700,
    minHeight: 48,
  },
  codeTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(1),
  },
  codeBlock: {
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: "#0f172a",
    color: "#dbeafe",
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: "auto",
    border: "1px solid rgba(99, 102, 241, 0.18)",
    fontFamily: "Consolas, 'Fira Code', 'Courier New', monospace",
    whiteSpace: "pre-wrap",
  },
  infoList: {
    margin: 0,
    paddingLeft: theme.spacing(2.5),
    color: "#334155",
    lineHeight: 1.8,
  },
  infoBox: {
    borderRadius: 12,
    padding: theme.spacing(1.5, 2),
    backgroundColor: "#f8fbff",
    border: "1px solid rgba(47,111,237,0.16)",
    color: "#1e3f73",
    fontSize: 14,
    lineHeight: 1.7,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#153760",
    marginBottom: theme.spacing(1.5),
  },
  formContainer: {
    width: "100%",
  },
  uploadInput: {
    width: "100%",
    border: "1px dashed rgba(30, 63, 115, 0.35)",
    borderRadius: 12,
    padding: theme.spacing(1.5),
    backgroundColor: "#f9fcff",
  },
  textRight: {
    textAlign: "right",
  },
  submitButton: {
    minWidth: 160,
    minHeight: 44,
    borderRadius: 10,
    textTransform: "none",
    fontWeight: 700,
    background: "linear-gradient(135deg, #1d4ed8 0%, #2f6fed 70%, #2eb8e7 100%)",
    boxShadow: "0 10px 20px rgba(29, 78, 216, 0.24)",
    "&:hover": {
      background:
        "linear-gradient(135deg, #1a45c0 0%, #255dd0 70%, #289ac1 100%)",
    },
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState({});
  const [formMessageTextData] = useState({
    token: "",
    number: "",
    body: "",
    userId: "",
    queueId: "",
  });
  const [formMessageMediaData] = useState({
    token: "",
    number: "",
    medias: "",
    body: "",
    userId: "",
    queueId: "",
  });

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error(
          "Esta empresa nao possui permissao para acessar essa pagina. Estamos lhe redirecionando."
        );
        setTimeout(() => {
          history.push("/");
        }, 1000);
      }
    }
    fetchData();
  }, [getPlanCompany, history, user.companyId]);

  const endpoint = useMemo(
    () => `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`,
    []
  );

  const textBodyExample = `{
  "number": "558599999999",
  "body": "Mensagem",
  "userId": "",
  "queueId": "",
  "sendSignature": true,
  "closeTicket": false
}`;

  const mediaFormDataExample = `number=558599999999
body=Nome do arquivo ou mensagem
userId=
queueId=
medias=<arquivo>
sendSignature=true
closeTicket=false`;

  const curlTextExample = `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${textBodyExample}'`;

  const curlMediaExample = `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -F "number=558599999999" \\
  -F "body=Mensagem com anexo" \\
  -F "medias=@/caminho/arquivo.png"`;

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    const data = { number, body, userId, queueId };
    try {
      await axios.request({
        url: endpoint,
        method: "POST",
        data,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${values.token}`,
        },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append("number", values.number);
      data.append("body", values.body ? values.body : firstFile.name);
      data.append("userId", values.userId);
      data.append("queueId", values.queueId);
      data.append("medias", firstFile);

      await axios.request({
        url: endpoint,
        method: "POST",
        data,
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${values.token}`,
        },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const renderTextForm = () => (
    <Formik
      initialValues={formMessageTextData}
      enableReinitialize
      onSubmit={(values, actions) => {
        setTimeout(async () => {
          await handleSendTextMessage(values);
          actions.setSubmitting(false);
          actions.resetForm();
        }, 400);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Typography className={classes.formTitle}>
            Testar envio de texto
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.token")}
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.body")}
                name="body"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.userId")}
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.queueId")}
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.submitButton}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} style={{ color: "#fff" }} />
                ) : (
                  i18n.t("messagesAPI.toSend")
                )}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderMediaForm = () => (
    <Formik
      initialValues={formMessageMediaData}
      enableReinitialize
      onSubmit={(values, actions) => {
        setTimeout(async () => {
          await handleSendMediaMessage(values);
          actions.setSubmitting(false);
          actions.resetForm();
          document.getElementById("medias").files = null;
          document.getElementById("medias").value = null;
        }, 400);
      }}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Typography className={classes.formTitle}>
            Testar envio de midia
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.token")}
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.body")}
                name="body"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.userId")}
                name="userId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.queueId")}
                name="queueId"
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                name="medias"
                id="medias"
                required
                className={classes.uploadInput}
                onChange={(e) => setFile(e.target.files)}
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.submitButton}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} style={{ color: "#fff" }} />
                ) : (
                  i18n.t("messagesAPI.toSend")
                )}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className={classes.pageRoot}>
      <Paper className={classes.heroCard} elevation={0}>
        <Typography className={classes.heroTitle}>
          API de Mensagens - Documentacao
        </Typography>
        <Typography className={classes.heroSubtitle}>
          Referencia tecnica para envio de mensagens de texto e midia usando
          token por conexao. Abaixo voce encontra endpoint, headers, payloads,
          exemplos em cURL e um painel de testes rapido.
        </Typography>
        <div className={classes.chipRow}>
          <Chip label="POST /api/messages/send" className={classes.chip} />
          <Chip label="Authorization: Bearer TOKEN" className={classes.chip} />
          <Chip label="application/json ou multipart/form-data" className={classes.chip} />
        </div>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper className={classes.sectionCard} variant="outlined">
            <div className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                Referencia da API
              </Typography>
              <Typography className={classes.sectionDescription}>
                Tudo o que o desenvolvedor precisa para integrar rapido e com
                padrao.
              </Typography>
            </div>
            <div className={classes.sectionBody}>
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                className={classes.tabsRoot}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Texto" className={classes.tabRoot} />
                <Tab label="Midia" className={classes.tabRoot} />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>Endpoint</Typography>
                    <pre className={classes.codeBlock}>{endpoint}</pre>
                  </Box>

                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>Body JSON</Typography>
                    <pre className={classes.codeBlock}>{textBodyExample}</pre>
                  </Box>

                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>Exemplo cURL</Typography>
                    <pre className={classes.codeBlock}>{curlTextExample}</pre>
                  </Box>

                  <div className={classes.infoBox}>
                    <strong>Observacoes importantes:</strong>
                    <ul className={classes.infoList}>
                      <li>Configure o token na conexao antes do envio.</li>
                      <li>Numero sem mascara e sem caracteres especiais.</li>
                      <li>Formato recomendado: codigo do pais + DDD + numero.</li>
                    </ul>
                  </div>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>Endpoint</Typography>
                    <pre className={classes.codeBlock}>{endpoint}</pre>
                  </Box>

                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>FormData</Typography>
                    <pre className={classes.codeBlock}>{mediaFormDataExample}</pre>
                  </Box>

                  <Box mb={2}>
                    <Typography className={classes.codeTitle}>Exemplo cURL</Typography>
                    <pre className={classes.codeBlock}>{curlMediaExample}</pre>
                  </Box>

                  <div className={classes.infoBox}>
                    <strong>Regras de envio de midia:</strong>
                    <ul className={classes.infoList}>
                      <li>Use `multipart/form-data`.</li>
                      <li>Campo `medias` e obrigatorio.</li>
                      <li>
                        Caso `body` nao seja enviado, o nome do arquivo sera usado.
                      </li>
                    </ul>
                  </div>
                </Box>
              )}
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper className={classes.sectionCard} variant="outlined">
            <div className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                Ambiente de teste
              </Typography>
              <Typography className={classes.sectionDescription}>
                Valide rapidamente os metodos sem sair da documentacao.
              </Typography>
            </div>
            <div className={classes.sectionBody}>
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                className={classes.tabsRoot}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Texto" className={classes.tabRoot} />
                <Tab label="Midia" className={classes.tabRoot} />
              </Tabs>
              {activeTab === 0 ? renderTextForm() : renderMediaForm()}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default MessagesAPI;
