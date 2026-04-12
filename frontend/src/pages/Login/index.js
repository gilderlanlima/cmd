import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import WbSunnyIcon from "@material-ui/icons/WbSunny";

import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import logo from "../../assets/logo.png";
import crmBackground from "../../assets/login-crm-bg.jpg";

const packageVersion = require("../../../package.json").version;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    minHeight: "100dvh",
    width: "100%",
    maxWidth: "100vw",
    minWidth: 0,
    display: "flex",
    backgroundColor:
      theme.palette.type === "dark" ? "#08111f" : "#eef3fb",
    overflow: "hidden",
    overflowX: "hidden",
    "@media (max-width: 1100px)": {
      flexDirection: "column",
      overflow: "auto",
    },
  },
  leftSide: {
    flex: 1,
    backgroundImage: `linear-gradient(135deg, rgba(6, 27, 79, 0.92) 0%, rgba(8, 61, 145, 0.78) 52%, rgba(18, 136, 198, 0.58) 100%), url(${crmBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "56px",
    "@media (max-width: 1100px)": {
      display: "none",
    },
    "@media (max-width: 1440px), (max-height: 820px)": {
      padding: "34px 30px",
      alignItems: "stretch",
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      padding: "20px 18px",
    },
  },
  leftPanel: {
    position: "relative",
    zIndex: 1,
    maxWidth: 640,
    width: "100%",
    color: "#ffffff",
    "@media (max-width: 1440px), (max-height: 820px)": {
      maxWidth: 540,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      maxWidth: 430,
    },
  },
  leftBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 22,
    backdropFilter: "blur(14px)",
  },
  leftOverlayText: {
    maxWidth: 620,
    color: "#ffffff",
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 54,
    letterSpacing: "-0.02em",
    marginBottom: 20,
    [theme.breakpoints.down("lg")]: {
      fontSize: 46,
    },
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 28,
      maxWidth: 420,
      marginBottom: 14,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 22,
      maxWidth: 330,
      marginBottom: 8,
    },
  },
  leftDescription: {
    maxWidth: 560,
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 18,
    lineHeight: 1.65,
    marginBottom: 28,
    "@media (max-width: 1440px), (max-height: 820px)": {
      maxWidth: 430,
      fontSize: 14,
      lineHeight: 1.45,
      marginBottom: 16,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      maxWidth: 330,
      fontSize: 11,
      lineHeight: 1.25,
      marginBottom: 10,
    },
  },
  leftHighlights: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "1fr",
    },
    "@media (max-width: 1440px), (max-height: 820px)": {
      gap: 10,
      maxWidth: 430,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      gap: 8,
      maxWidth: 330,
    },
  },
  highlightCard: {
    minHeight: 128,
    padding: "18px 18px 20px",
    borderRadius: 20,
    backgroundColor: "rgba(8, 22, 59, 0.38)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.16)",
    backdropFilter: "blur(16px)",
    "@media (max-width: 1440px), (max-height: 820px)": {
      minHeight: 0,
      padding: "12px 12px 14px",
      borderRadius: 16,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      padding: "9px 9px 11px",
      borderRadius: 13,
    },
  },
  highlightLabel: {
    color: "#a8d8ff",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  highlightTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 8,
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 15,
      lineHeight: 1.2,
      marginBottom: 6,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 12,
      lineHeight: 1.12,
      marginBottom: 3,
    },
  },
  highlightText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 1.55,
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 12,
      lineHeight: 1.35,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 10,
      lineHeight: 1.2,
    },
  },
  rightSide: {
    width: 506,
    minWidth: 506,
    maxWidth: "100%",
    minHeight: 0,
    background:
      theme.palette.type === "dark"
        ? "linear-gradient(180deg, #091425 0%, #0d1d33 52%, #12253f 100%)"
        : "linear-gradient(180deg, #f7faff 0%, #eef3fb 50%, #e8eef9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "22px 30px 18px",
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      minWidth: "100%",
      padding: "20px 18px 16px",
    },
    "@media (max-width: 1440px), (max-height: 820px)": {
      width: 336,
      minWidth: 336,
      padding: "14px 14px 10px",
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      width: 286,
      minWidth: 286,
      padding: "10px 10px 8px",
    },
    "@media (max-width: 1100px)": {
      width: "100%",
      minWidth: "100%",
      height: "100vh",
      minHeight: "100dvh",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: "12px 18px 10px",
      overflowX: "hidden",
    },
  },
  card: {
    width: "min(100%, 430px)",
    maxWidth: 430,
    minWidth: 0,
    overflow: "hidden",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 12,
    margin: "auto",
    "@media (max-width: 1440px), (max-height: 820px)": {
      width: "100%",
      maxWidth: 308,
      gap: 8,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      maxWidth: 260,
      gap: 4,
    },
    "@media (max-width: 1100px)": {
      width: "min(100%, 420px)",
      maxWidth: 420,
      minHeight: "100%",
      justifyContent: "flex-start",
      gap: 8,
      margin: 0,
    },
  },
  topBar: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 2,
    "@media (max-width: 1100px)": {
      marginBottom: 0,
    },
  },
  modeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    border: `1px solid ${
      theme.palette.type === "dark"
        ? "rgba(129, 162, 213, 0.24)"
        : "rgba(11, 79, 188, 0.12)"
    }`,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(17, 35, 62, 0.92)"
        : "rgba(255, 255, 255, 0.92)",
    color: theme.palette.type === "dark" ? "#dbe8ff" : "#0b4fbc",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 10px 30px rgba(0, 0, 0, 0.24)"
        : "0 10px 24px rgba(10, 47, 102, 0.10)",
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(24, 46, 79, 0.98)"
          : "rgba(248, 251, 255, 1)",
    },
  },
  logo: {
    width: 286,
    maxWidth: "100%",
    height: "auto",
    marginBottom: 2,
    "@media (max-width: 1440px), (max-height: 820px)": {
      width: 168,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      width: 132,
    },
    "@media (max-width: 1100px)": {
      width: 214,
    },
  },
  subHeading: {
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#edf4ff" : "#0a2f66",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.25,
    letterSpacing: "0.01em",
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 13,
      lineHeight: 1.2,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 11,
    },
    "@media (max-width: 1100px)": {
      fontSize: 14,
    },
  },
  formBox: {
    width: "100%",
    maxWidth: 430,
    minWidth: 0,
    backgroundColor:
      theme.palette.type === "dark" ? "#0f1d32" : "#ffffff",
    borderRadius: 22,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 18px 40px rgba(0, 0, 0, 0.32)"
        : "0 18px 40px rgba(10, 47, 102, 0.12)",
    border: `1px solid ${
      theme.palette.type === "dark" ? "#20324f" : "#d8e3f4"
    }`,
    padding: "26px 24px",
    minHeight: 312,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    "@media (max-width: 1440px), (max-height: 820px)": {
      maxWidth: 286,
      padding: "14px 14px",
      minHeight: 202,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      maxWidth: 244,
      minHeight: 164,
      padding: "10px 10px",
      borderRadius: 16,
    },
    "@media (max-width: 1100px)": {
      minHeight: 212,
      padding: "14px 16px",
    },
  },
  form: {
    width: "100%",
    maxWidth: 340,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    "@media (max-width: 1440px), (max-height: 820px)": {
      maxWidth: 250,
      gap: 10,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      maxWidth: 214,
      gap: 7,
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 14,
      backgroundColor:
        theme.palette.type === "dark" ? "#12243d" : "#f8fbff",
      minHeight: 54,
      color: theme.palette.type === "dark" ? "#eef4ff" : "#11243f",
      "& fieldset": {
        borderColor: theme.palette.type === "dark" ? "#294265" : "#d6e2f3",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.type === "dark" ? "#5c83ba" : "#8db4ef",
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.type === "dark" ? "#7db3ff" : "#0b4fbc",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 600,
      color: theme.palette.type === "dark" ? "#c6dafc" : "#294370",
      letterSpacing: "0.02em",
      fontSize: 14,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.type === "dark" ? "#dce9ff" : "#0b4fbc",
    },
    "& .MuiOutlinedInput-input": {
      padding: "15px 14px",
      fontSize: 15,
    },
    "@media (max-width: 1440px), (max-height: 820px)": {
      "& .MuiOutlinedInput-root": {
        minHeight: 40,
      },
      "& .MuiOutlinedInput-input": {
        padding: "8px 12px",
        fontSize: 12,
      },
      "& .MuiInputLabel-root": {
        fontSize: 12,
      },
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      "& .MuiOutlinedInput-root": {
        minHeight: 34,
      },
      "& .MuiOutlinedInput-input": {
        padding: "6px 10px",
        fontSize: 10,
      },
      "& .MuiInputLabel-root": {
        fontSize: 10,
      },
    },
  },
  submitWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  submitBtn: {
    minWidth: 112,
    borderRadius: 12,
    padding: "8px 18px",
    background: "linear-gradient(90deg, #1d5bcc 0%, #18a6e6 100%)",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    fontSize: 15,
    "@media (max-width: 1440px), (max-height: 820px)": {
      minWidth: 82,
      padding: "5px 12px",
      fontSize: 12,
      borderRadius: 10,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      minWidth: 68,
      padding: "4px 10px",
      fontSize: 10,
    },
    "&:hover": {
      background: "linear-gradient(90deg, #1548ac 0%, #0e8fca 100%)",
    },
  },
  versionText: {
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#93a8cc" : "#7081a3",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginTop: 4,
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 9,
      marginTop: 0,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 7,
    },
  },
  versionValue: {
    display: "block",
    marginTop: 4,
    color: theme.palette.type === "dark" ? "#dce8ff" : "#2a5eba",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.04em",
    "@media (max-width: 1440px), (max-height: 820px)": {
      fontSize: 13,
      marginTop: 2,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 11,
    },
  },
  footer: {
    marginTop: "auto",
    paddingTop: 6,
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#95a9cb" : "#5b6f92",
    fontSize: 13,
    lineHeight: 1.65,
    "@media (max-width: 1440px), (max-height: 820px)": {
      marginTop: 2,
      paddingTop: 2,
      fontSize: 10,
      lineHeight: 1.2,
    },
    "@media (max-width: 1366px), (max-height: 700px)": {
      fontSize: 8,
    },
  },
}));

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const colorModeContext = useContext(ColorModeContext);
  const colorMode = colorModeContext?.colorMode;
  const appName = colorMode?.appName || "CRM Ideia no Bolso";
  const appLogoFavicon =
    colorMode?.appLogoFavicon || "/favicon.ico";
  const isDarkMode = colorMode?.mode === "dark";
  const themeLoginLogo = useMemo(() => {
    const fromThemeCalculated = isDarkMode
      ? colorMode?.calculatedLogoDark?.()
      : colorMode?.calculatedLogoLight?.();
    const fromThemeDirect = isDarkMode
      ? colorMode?.appLogoDark || colorMode?.appLogoLight
      : colorMode?.appLogoLight || colorMode?.appLogoDark;
    return fromThemeCalculated || fromThemeDirect || logo;
  }, [colorMode, isDarkMode]);

  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({ email: "", password: "" });
  const [logoSrc, setLogoSrc] = useState(themeLoginLogo);
  const [systemVersion, setSystemVersion] = useState(packageVersion);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLogoSrc(themeLoginLogo || logo);
  }, [themeLoginLogo]);

  useEffect(() => {
    let isMounted = true;

    const loadVersion = async () => {
      try {
        const storedVersion = window.localStorage.getItem("frontendVersion");
        if (storedVersion === packageVersion && isMounted) {
          setSystemVersion(storedVersion);
        }

        const response = await api.get("/version");
        const version = response?.data?.version;

        if (version === packageVersion && isMounted) {
          setSystemVersion(version);
          return;
        }
      } catch (error) {
        const storedVersion = window.localStorage.getItem("frontendVersion");
        if (storedVersion === packageVersion && isMounted) {
          setSystemVersion(storedVersion);
        }
      }

      if (isMounted) {
        setSystemVersion(packageVersion);
      }
    };

    loadVersion();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeInput = (e) => {
    const target = e?.target;
    if (!target?.name) return;
    const { name, value } = target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>{appName}</title>
        <link rel="icon" href={appLogoFavicon} />
      </Helmet>

      <div className={classes.root}>
        <div className={classes.leftSide}>
          <div className={classes.leftPanel}>
            <div className={classes.leftBadge}>CRM Ideia no Bolso</div>
            <Typography className={classes.leftOverlayText}>
              Centralize atendimento, relacionamento e oportunidades em um só
              lugar.
            </Typography>
            <Typography className={classes.leftDescription}>
              Um painel pensado para equipes que precisam acompanhar tickets,
              contatos, filas, conexões e desempenho comercial com mais clareza
              e velocidade.
            </Typography>

            <div className={classes.leftHighlights}>
              <div className={classes.highlightCard}>
                <div className={classes.highlightLabel}>Relacionamento</div>
                <div className={classes.highlightTitle}>
                  Histórico completo do cliente
                </div>
                <div className={classes.highlightText}>
                  Reúna conversas, contatos e contexto do atendimento no mesmo
                  fluxo operacional.
                </div>
              </div>

              <div className={classes.highlightCard}>
                <div className={classes.highlightLabel}>Produtividade</div>
                <div className={classes.highlightTitle}>
                  Operação organizada em tempo real
                </div>
                <div className={classes.highlightText}>
                  Distribua tickets, acompanhe filas e mantenha a equipe focada
                  no que importa.
                </div>
              </div>

              <div className={classes.highlightCard}>
                <div className={classes.highlightLabel}>Gestão</div>
                <div className={classes.highlightTitle}>
                  Visão comercial mais estratégica
                </div>
                <div className={classes.highlightText}>
                  Transforme dados do CRM em acompanhamento prático para vender
                  melhor e atender com consistência.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.rightSide}>
          <div className={classes.card}>
            <div className={classes.topBar}>
              <IconButton
                className={classes.modeButton}
                onClick={() => colorMode?.toggleColorMode?.()}
                aria-label={
                  isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"
                }
              >
                {isDarkMode ? <WbSunnyIcon /> : <Brightness4Icon />}
              </IconButton>
            </div>
            <img
              src={logoSrc}
              alt="Ideia no Bolso"
              className={classes.logo}
              onError={() => setLogoSrc(logo)}
            />
            <Typography className={classes.subHeading}>
              Bem-vindo ao CRM Ideia no Bolso!
            </Typography>

            <div className={classes.formBox}>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Login"
                  name="email"
                  value={user.email}
                  onChange={handleChangeInput}
                  autoComplete="email"
                  autoFocus
                  className={classes.textField}
                />

                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={user.password}
                  onChange={handleChangeInput}
                  autoComplete="current-password"
                  className={classes.textField}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="alternar visibilidade da senha"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <div className={classes.submitWrap}>
                  <Button
                    type="submit"
                    variant="contained"
                    className={classes.submitBtn}
                  >
                    Entrar
                  </Button>
                </div>
              </form>
            </div>

            <Typography className={classes.versionText}>
              Versão atual do sistema
              <span className={classes.versionValue}>{systemVersion}</span>
            </Typography>

            <div className={classes.footer}>
              <div>CNPJ 64.016.500/0001-02</div>
              <div>Desenvolvido por Ideia no Bolso LTDA - {currentYear}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
