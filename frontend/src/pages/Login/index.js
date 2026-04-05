import React, { useState, useContext } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import { getBackendUrl } from "../../config";
import packageJson from "../../../package.json";
import heroImage from "../../assets/wa-background.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(420px, 0.92fr)",
    backgroundColor: "#f3f6fb",
    [theme.breakpoints.down(1366)]: {
      gridTemplateColumns: "1fr",
    },
  },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.22), transparent 20%), linear-gradient(135deg, #17305a 0%, #246fdd 58%, #37d3f4 100%)",
    [theme.breakpoints.down(1366)]: {
      display: "none",
    },
  },
  heroBackdrop: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.2,
    mixBlendMode: "screen",
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.4), transparent 24%), radial-gradient(circle at 70% 26%, rgba(255,255,255,0.14), transparent 26%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 820,
    padding: "48px 56px",
    color: "#ffffff",
  },
  heroCard: {
    maxWidth: 560,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    backdropFilter: "blur(12px)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 56,
    lineHeight: 1.04,
    fontWeight: 800,
    marginBottom: 20,
    [theme.breakpoints.down(1600)]: {
      fontSize: 48,
    },
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.9)",
  },
  formPanel: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "36px 28px",
    background:
      "linear-gradient(180deg, rgba(246,249,254,1) 0%, rgba(236,242,251,1) 100%)",
    [theme.breakpoints.down(600)]: {
      padding: "20px 16px",
    },
  },
  formShell: {
    width: "100%",
    maxWidth: 470,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoBlock: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 34,
  },
  logoImg: {
    width: "100%",
    maxWidth: 280,
    height: "auto",
    marginBottom: 20,
    content:
      "url(" +
      (theme.mode === "light"
        ? theme.calculatedLogoLight()
        : theme.calculatedLogoDark()) +
      ")",
  },
  welcomeTitle: {
    fontSize: 16,
    lineHeight: 1.4,
    fontWeight: 700,
    letterSpacing: "0.03em",
    color: "#16345f",
    textTransform: "uppercase",
  },
  loginCard: {
    width: "100%",
    borderRadius: 28,
    padding: "28px 26px 24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    [theme.breakpoints.down(600)]: {
      padding: "24px 18px 20px",
      borderRadius: 24,
    },
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    display: "block",
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#16345f",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 14,
      backgroundColor: "#ffffff",
      "& fieldset": {
        borderColor: "rgba(15, 23, 42, 0.12)",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}14`,
      },
    },
    "& .MuiInputBase-input": {
      paddingTop: 15,
      paddingBottom: 15,
      color: "#0f172a",
    },
  },
  submit: {
    minHeight: 48,
    borderRadius: 12,
    padding: "0 26px",
    minWidth: 132,
    fontSize: 16,
    fontWeight: 700,
    textTransform: "none",
    background:
      "linear-gradient(135deg, #205ec8 0%, #2f6fed 55%, #2eb8e7 100%)",
    boxShadow: "0 14px 30px rgba(35,95,190,0.28)",
    "&:hover": {
      background:
        "linear-gradient(135deg, #1a4ea6 0%, #245ecc 55%, #269ec8 100%)",
    },
  },
  submitRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },
  versionBlock: {
    marginTop: 28,
    textAlign: "center",
  },
  versionLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#7f8ea3",
    fontFamily: "'Segoe UI', 'Inter', 'Roboto', sans-serif",
  },
  versionValue: {
    marginTop: 4,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#2f6fed",
    fontFamily: "'Segoe UI', 'Inter', 'Roboto', sans-serif",
  },
  copyright: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#94a3b8",
    textAlign: "center",
  },
}));

const Login = () => {
  const classes = useStyles();
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName } = colorMode;
  const { handleLogin } = useContext(AuthContext);
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeInput = ({ target }) => {
    setUser((currentUser) => ({ ...currentUser, [target.name]: target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>{appName || "CRM"}</title>
        <link rel="icon" href={appLogoFavicon || `${getBackendUrl()}/favicon.ico`} />
      </Helmet>

      <div className={classes.root}>
        <CssBaseline />

        <section className={classes.heroPanel}>
          <img
            src={heroImage}
            alt="Ambiente visual do CRM"
            className={classes.heroBackdrop}
          />
          <div className={classes.heroGlow} />
          <div className={classes.heroContent}>
            <div className={classes.heroCard}>
              <Typography className={classes.heroBadge}>
                CRM Ideia no Bolso
              </Typography>
              <Typography component="h1" className={classes.heroTitle}>
                Atendimento, operação e gestão comercial em um único painel.
              </Typography>
              <Typography className={classes.heroDescription}>
                Controle tickets, filas, conexões, usuários e automações com uma
                experiência mais clara para a rotina da equipe.
              </Typography>
            </div>
          </div>
        </section>

        <section className={classes.formPanel}>
          <div className={classes.formShell}>
            <div className={classes.logoBlock}>
              <img className={classes.logoImg} alt="Logo do sistema" />
              <Typography className={classes.welcomeTitle}>
                Bem-vindo ao painel
              </Typography>
            </div>

            <div className={classes.loginCard}>
              <form noValidate onSubmit={handleSubmit}>
                <div className={classes.fieldGroup}>
                  <Typography className={classes.fieldLabel}>Login</Typography>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    name="email"
                    placeholder="Digite seu login"
                    value={user.email}
                    onChange={handleChangeInput}
                    autoComplete="email"
                    autoFocus
                    className={classes.textField}
                  />
                </div>

                <div className={classes.fieldGroup}>
                  <Typography className={classes.fieldLabel}>Senha</Typography>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Digite sua senha"
                    value={user.password}
                    onChange={handleChangeInput}
                    autoComplete="current-password"
                    className={classes.textField}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="mostrar ou ocultar senha"
                            onClick={() => setShowPassword((visible) => !visible)}
                            edge="end"
                            style={{ color: "#64748b" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className={classes.submitRow}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    Entrar
                  </Button>
                </div>
              </form>
            </div>

            <div className={classes.versionBlock}>
              <Typography className={classes.versionLabel}>Versão</Typography>
              <Typography className={classes.versionValue}>
                {packageJson.version}
              </Typography>
            </div>

            <Typography className={classes.copyright}>
              {new Date().getFullYear()} {appName || "CRM"}. Todos os direitos
              reservados.
            </Typography>
          </div>
        </section>
      </div>
    </>
  );
};

export default Login;
