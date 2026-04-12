import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  CodeRounded,
  DescriptionOutlined,
  PlayCircleOutline,
  SendRounded,
} from "@material-ui/icons";
import { toast } from "react-toastify";

import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
  },
  hero: {
    padding: theme.spacing(4),
    borderRadius: 24,
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 62%, #38bdf8 100%)",
    color: "#fff",
  },
  heroHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  heroTitle: {
    fontWeight: 800,
    fontSize: "2.3rem",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.8rem",
    },
  },
  heroText: {
    maxWidth: 760,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.86)",
    marginTop: theme.spacing(1.5),
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  statCard: {
    padding: theme.spacing(2),
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  card: {
    borderRadius: 22,
    padding: theme.spacing(3),
  },
  codeBlock: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2.5),
    borderRadius: 16,
    background: "#0f172a",
    color: "#e2e8f0",
    overflowX: "auto",
    fontSize: "0.9rem",
    lineHeight: 1.7,
  },
  playgroundCard: {
    height: "100%",
  },
  formCard: {
    padding: theme.spacing(3),
    borderRadius: 18,
    border: `1px solid ${theme.palette.divider}`,
    height: "100%",
  },
  formTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 800,
    marginBottom: theme.spacing(1),
  },
  endpointChip: {
    fontWeight: 700,
  },
  methodsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  methodCard: {
    padding: theme.spacing(2),
    borderRadius: 18,
    border: `1px solid ${theme.palette.divider}`,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
}));

const initialTextData = {
  token: "",
  number: "",
  body: "",
  userId: "",
  queueId: "",
};

const initialMediaData = {
  token: "",
  number: "",
  medias: "",
  body: "",
  userId: "",
  queueId: "",
};

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [file, setFile] = useState({});

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página. Redirecionando...");
        setTimeout(() => history.push("/"), 1000);
      }
    }
    fetchData();
  }, [getPlanCompany, history, user.companyId]);

  const endpoint = useMemo(() => `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`, []);

  const textSample = useMemo(
    () =>
      `curl --request POST \\\n  --url ${endpoint} \\\n  --header "Authorization: Bearer SEU_TOKEN" \\\n  --header "Content-Type: application/json" \\\n  --data '{\n    "number": "5511999999999",\n    "body": "Olá! Esta mensagem foi enviada via API.",\n    "userId": "1",\n    "queueId": "2"\n  }'`,
    [endpoint]
  );

  const mediaSample = useMemo(
    () =>
      `curl --request POST \\\n  --url ${endpoint} \\\n  --header "Authorization: Bearer SEU_TOKEN" \\\n  --header "Content-Type: multipart/form-data" \\\n  --form "number=5511999999999" \\\n  --form "body=Segue o arquivo" \\\n  --form "userId=1" \\\n  --form "queueId=2" \\\n  --form "medias=@/caminho/arquivo.pdf"`,
    [endpoint]
  );

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;

    try {
      await axios.request({
        url: endpoint,
        method: "POST",
        data: { number, body, userId, queueId },
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
      data.append("body", values.body || firstFile.name);
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
      toast.success("Arquivo enviado com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const renderForm = ({ type, title, description, initialValues, onSubmit }) => (
    <Paper className={classes.formCard} elevation={0}>
      <Typography variant="h6" className={classes.formTitle}>
        {type === "text" ? <SendRounded color="primary" /> : <PlayCircleOutline color="primary" />}
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {description}
      </Typography>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await onSubmit(values);
            actions.setSubmitting(false);
            actions.resetForm();
            if (type === "media") {
              const mediaInput = document.getElementById("messages-api-media");
              if (mediaInput) {
                mediaInput.files = null;
                mediaInput.value = null;
              }
            }
          }, 250);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label="Token"
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
                  label="Número"
                  name="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label="Fila (opcional)"
                  name="queueId"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label="Usuário responsável (opcional)"
                  name="userId"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label="Mensagem"
                  name="body"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required={type === "text"}
                />
              </Grid>
              {type === "media" && (
                <Grid item xs={12}>
                  <input
                    type="file"
                    name="medias"
                    id="messages-api-media"
                    required
                    onChange={(e) => setFile(e.target.files)}
                  />
                </Grid>
              )}
            </Grid>

            <div className={classes.buttonRow}>
              <Button type="submit" color="primary" variant="contained">
                {isSubmitting ? <CircularProgress size={22} /> : "Executar teste"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Paper>
  );

  return (
    <MainContainer>
      <div className={classes.page}>
        <Paper className={classes.hero} elevation={0}>
          <div className={classes.heroHeader}>
            <div>
              <Chip
                icon={<CodeRounded style={{ color: "#fff" }} />}
                label="API de Mensagens"
                style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700 }}
              />
              <Typography className={classes.heroTitle}>
                Documentação técnica para integrações do CRM
              </Typography>
              <Typography className={classes.heroText}>
                Envie mensagens de texto e mídia a partir do CRM usando um endpoint único. Esta página foi redesenhada para que a equipe DEV tenha uma visão mais próxima de uma documentação de framework: endpoint, payload, headers, exemplos e playground técnico em um só lugar.
              </Typography>
            </div>
            <Box textAlign="right">
              <Title>API</Title>
              <Typography variant="body2" style={{ color: "rgba(255,255,255,0.82)" }}>
                Endpoint principal
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 700 }}>
                {endpoint}
              </Typography>
            </Box>
          </div>

          <div className={classes.heroStats}>
            <div className={classes.statCard}>
              <Typography variant="overline">Método</Typography>
              <Typography variant="h5">POST</Typography>
            </div>
            <div className={classes.statCard}>
              <Typography variant="overline">Autenticação</Typography>
              <Typography variant="h5">Bearer Token</Typography>
            </div>
            <div className={classes.statCard}>
              <Typography variant="overline">Payloads</Typography>
              <Typography variant="h5">JSON e FormData</Typography>
            </div>
          </div>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper className={classes.card} elevation={0} variant="outlined">
              <Typography variant="h5" className={classes.sectionTitle}>
                Referência rápida
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Use o mesmo endpoint para texto e mídia. O comportamento muda conforme o tipo de conteúdo enviado.
              </Typography>

              <div className={classes.methodsList}>
                <div className={classes.methodCard}>
                  <Chip label="POST /api/messages/send" color="primary" className={classes.endpointChip} />
                  <Typography variant="subtitle1" style={{ marginTop: 12, fontWeight: 700 }}>
                    Enviar texto
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Payload em JSON com número, corpo, usuário e fila.
                  </Typography>
                </div>
                <div className={classes.methodCard}>
                  <Chip label="POST /api/messages/send" color="primary" className={classes.endpointChip} />
                  <Typography variant="subtitle1" style={{ marginTop: 12, fontWeight: 700 }}>
                    Enviar mídia
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Envio em multipart/form-data com arquivo e mensagem opcional.
                  </Typography>
                </div>
              </div>

              <Divider style={{ margin: "24px 0" }} />

              <Typography variant="h6" className={classes.sectionTitle}>
                Regras do request
              </Typography>
              <Typography variant="body2" color="textSecondary" component="div">
                <ul>
                  <li>Autentique sempre com <strong>Authorization: Bearer &lt;token&gt;</strong>.</li>
                  <li>O número deve estar completo com DDI e DDD, sem caracteres especiais.</li>
                  <li><strong>userId</strong> e <strong>queueId</strong> são opcionais, mas ajudam no roteamento.</li>
                  <li>Para mídia, use o campo <strong>medias</strong> com multipart/form-data.</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper className={classes.card} elevation={0} variant="outlined">
              <Typography variant="h5" className={classes.sectionTitle}>
                Exemplos prontos
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use estes snippets como base para integrações em backend, automações ou testes rápidos.
              </Typography>

              <Typography variant="subtitle1" style={{ marginTop: 24, fontWeight: 700 }}>
                Texto
              </Typography>
              <pre className={classes.codeBlock}>{textSample}</pre>

              <Typography variant="subtitle1" style={{ marginTop: 24, fontWeight: 700 }}>
                Mídia
              </Typography>
              <pre className={classes.codeBlock}>{mediaSample}</pre>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderForm({
              type: "text",
              title: "Playground • envio de texto",
              description: "Faça um teste controlado do endpoint de texto sem sair do painel.",
              initialValues: initialTextData,
              onSubmit: handleSendTextMessage,
            })}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderForm({
              type: "media",
              title: "Playground • envio de mídia",
              description: "Teste o envio de arquivos com a mesma autenticação usada pela API externa.",
              initialValues: initialMediaData,
              onSubmit: handleSendMediaMessage,
            })}
          </Grid>
        </Grid>

        <Paper className={classes.card} elevation={0} variant="outlined">
          <Typography variant="h5" className={classes.sectionTitle}>
            Estrutura mínima esperada
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Para manter o fluxo previsível, a API trabalha com alguns campos padrão.
          </Typography>

          <div className={classes.codeBlock}>
            {`{
  "number": "5511999999999",
  "body": "Mensagem",
  "userId": "1",
  "queueId": "2",
  "sendSignature": false,
  "closeTicket": false
}`}
          </div>

          <Box mt={3} display="flex" alignItems="center" gridGap={12}>
            <DescriptionOutlined color="primary" />
            <Typography variant="body2" color="textSecondary">
              Esta página é a nova base visual da documentação da API. Na próxima etapa podemos incluir autenticação, exemplos por linguagem, status de resposta e um menu lateral de endpoints.
            </Typography>
          </Box>
        </Paper>
      </div>
    </MainContainer>
  );
};

export default MessagesAPI;
