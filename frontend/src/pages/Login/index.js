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
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    backgroundColor:
      theme.palette.type === "dark" ? "#08111f" : "#eef3fb",
    overflow: "hidden",
    "@media (max-width: 1365px)": {
      flexDirection: "column",
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
    "@media (max-width: 1365px)": {
      display: "none",
    },
    "@media (max-height: 760px)": {
      padding: "36px 42px",
    },
  },
  leftPanel: {
    position: "relative",
    zIndex: 1,
    maxWidth: 640,
    width: "100%",
    color: "#ffffff",
    "@media (max-width: 1365px)": {
      maxWidth: 760,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
    "@media (max-width: 1365px)": {
      fontSize: 38,
      maxWidth: 680,
    },
    "@media (max-height: 760px)": {
      fontSize: 42,
      marginBottom: 14,
    },
  },
  leftDescription: {
    maxWidth: 560,
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 18,
    lineHeight: 1.65,
    marginBottom: 28,
    "@media (max-width: 1365px)": {
      maxWidth: 680,
    },
    "@media (max-height: 760px)": {
      fontSize: 16,
      lineHeight: 1.5,
      marginBottom: 18,
    },
  },
  leftHighlights: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "1fr",
    },
    "@media (max-width: 1365px)": {
      width: "100%",
      maxWidth: 520,
    },
    "@media (max-height: 760px)": {
      gap: 12,
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
    "@media (max-height: 760px)": {
      minHeight: 106,
      padding: "14px 16px 16px",
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
  },
  highlightText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 1.55,
  },
  rightSide: {
    width: 506,
    minWidth: 506,
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
    "@media (max-width: 1365px)": {
      width: "100%",
      minWidth: "100%",
      minHeight: "100vh",
      padding: "22px 18px 16px",
    },
    "@media (max-height: 760px)": {
      padding: "14px 26px 12px",
    },
  },
  card: {
    width: "min(100%, 430px)",
    maxWidth: 430,
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 12,
    "@media (max-width: 1365px)": {
      width: "min(100%, 430px)",
      maxWidth: 430,
    },
  },
  topBar: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 2,
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
    "@media (max-height: 760px)": {
      width: 260,
    },
  },
  subHeading: {
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#edf4ff" : "#0a2f66",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.25,
    letterSpacing: "0.01em",
    "@media (max-height: 760px)": {
      fontSize: 17,
    },
  },
  formBox: {
    width: "100%",
    maxWidth: 430,
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
    "@media (max-height: 760px)": {
      minHeight: 292,
      padding: "22px 20px",
    },
  },
  form: {
    width: "100%",
    maxWidth: 340,
    display: "flex",
    flexDirection: "column",
    gap: 20,
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
  },
  versionValue: {
    display: "block",
    marginTop: 4,
    color: theme.palette.type === "dark" ? "#dce8ff" : "#2a5eba",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 6,
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#95a9cb" : "#5b6f92",
    fontSize: 13,
    lineHeight: 1.65,
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
