import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Button, IconButton, InputAdornment, TextField, Typography } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import WbSunnyIcon from "@material-ui/icons/WbSunny";

import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import logo from "../../assets/logo.png";
import crmBackground from "../../assets/login-crm-bg.jpg";

const packageVersion = require("../../../package.json").version;

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: "100dvh",
    display: "flex",
    background: "#eef4fb",
    overflowX: "hidden",
    overflowY: "auto",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },

  leftSide: {
    flex: "1 1 58%",
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    color: "#fff",
    backgroundImage: `linear-gradient(135deg, ${alpha(
      theme.palette.primary.dark || theme.palette.primary.main,
      0.95
    )} 0%, ${alpha(theme.palette.primary.main, 0.88)} 48%, ${alpha(
      theme.palette.primary.light || theme.palette.primary.main,
      0.68
    )} 100%), url(${crmBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center center",
    [theme.breakpoints.down("md")]: {
      minHeight: "auto",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  leftPanel: {
    width: "100%",
    maxWidth: 680,
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(4.5, 4, 3.5),
    [theme.breakpoints.down("lg")]: {
      maxWidth: 620,
      padding: theme.spacing(3.5, 3, 3),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3, 2, 2.25),
    },
    "@media (max-height: 840px)": {
      padding: theme.spacing(2.75, 3, 2.5),
      maxWidth: 590,
    },
  },

  leftBadge: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    padding: theme.spacing(1.15, 3),
    borderRadius: 999,
    marginBottom: theme.spacing(2),
    backdropFilter: "blur(10px)",
    background: alpha("#ffffff", 0.14),
    border: `1px solid ${alpha("#ffffff", 0.2)}`,
    boxShadow: `0 16px 36px ${alpha("#04132f", 0.18)}`,
    fontSize: "0.92rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(2.5),
    },
  },

  leftOverlayText: {
    maxWidth: 660,
    marginBottom: theme.spacing(2),
  },

  leftTitle: {
    fontSize: "clamp(1.9rem, 3.2vw, 3.05rem)",
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: "-0.025em",
    marginBottom: theme.spacing(1.35),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
    "@media (max-height: 840px)": {
      fontSize: "clamp(1.65rem, 2.8vw, 2.55rem)",
      marginBottom: theme.spacing(1),
    },
  },

  leftDescription: {
    maxWidth: 600,
    fontSize: "clamp(0.92rem, 1.05vw, 1rem)",
    lineHeight: 1.55,
    color: alpha("#ffffff", 0.92),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
    "@media (max-height: 840px)": {
      fontSize: "0.9rem",
      lineHeight: 1.45,
    },
  },

  leftHighlights: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.6),
  },

  highlightCard: {
    padding: theme.spacing(1.45, 1.8),
    borderRadius: 20,
    backdropFilter: "blur(12px)",
    background: alpha("#0d1d45", 0.3),
    border: `1px solid ${alpha("#ffffff", 0.12)}`,
    boxShadow: `0 18px 32px ${alpha("#061126", 0.16)}`,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.25, 1.4),
    },
    "@media (max-height: 840px)": {
      padding: theme.spacing(1.1, 1.45),
    },
  },

  highlightLabel: {
    display: "block",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: alpha("#ffffff", 0.78),
    marginBottom: theme.spacing(0.55),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  highlightTitle: {
    fontSize: "0.92rem",
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: theme.spacing(0.35),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  highlightText: {
    fontSize: "0.84rem",
    lineHeight: 1.5,
    color: alpha("#ffffff", 0.84),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  rightSide: {
    flex: "0 0 42%",
    width: "42%",
    minWidth: 420,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fbff",
    padding: theme.spacing(3, 2.5),
    position: "relative",
    [theme.breakpoints.down("md")]: {
      flex: "1 1 auto",
      width: "100%",
      minWidth: 0,
      padding: theme.spacing(2.75, 2, 3),
    },
    [theme.breakpoints.down("sm")]: {
      flex: "1 1 100%",
      width: "100%",
      padding: theme.spacing(2.25, 1.1, 2.5),
      minHeight: "100dvh",
    },
    "@media (max-height: 840px)": {
      padding: theme.spacing(2.5, 2.1),
    },
  },

  loginShell: {
    width: "min(100%, 440px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },

  themeToggle: {
    position: "absolute",
    top: theme.spacing(2.2),
    right: theme.spacing(2.2),
    width: 48,
    height: 48,
    borderRadius: 16,
    background: "#fff",
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    [theme.breakpoints.down("sm")]: {
      top: theme.spacing(2),
      right: theme.spacing(1.5),
    },
  },

  logo: {
    width: 220,
    maxWidth: "100%",
    objectFit: "contain",
    "@media (max-height: 840px)": {
      width: 190,
    },
  },

  heading: {
    fontSize: "clamp(1.45rem, 2vw, 1.9rem)",
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: "-0.02em",
    textAlign: "center",
    color: "#10213f",
    marginTop: theme.spacing(0.25),
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  subHeading: {
    maxWidth: 380,
    fontSize: "0.98rem",
    lineHeight: 1.5,
    color: "#5a6c8f",
    textAlign: "center",
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  mobileDivider: {
    display: "none",
    width: "100%",
    height: 1,
    background: alpha(theme.palette.primary.main, 0.12),
    [theme.breakpoints.down("md")]: {
      display: "block",
    },
  },

  formBox: {
    width: "100%",
    minHeight: 0,
    padding: theme.spacing(2.35, 2.35),
    borderRadius: 26,
    background: "#ffffff",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: `0 24px 54px ${alpha(theme.palette.primary.main, 0.12)}`,
    [theme.breakpoints.down("sm")]: {
      borderRadius: 24,
      padding: theme.spacing(2.5, 1.6),
    },
  },

  form: {
    width: "100%",
    maxWidth: 340,
    margin: "0 auto",
    display: "grid",
    gap: theme.spacing(1.3),
  },

  textField: {
    "& .MuiOutlinedInput-root": {
      minHeight: 48,
      borderRadius: 18,
      background: "#f8fbff",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: alpha(theme.palette.primary.main, 0.18),
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: alpha(theme.palette.primary.main, 0.28),
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
    "& .MuiInputBase-input": {
      padding: theme.spacing(1.75, 1.8),
      fontSize: "1rem",
      fontWeight: 600,
      color: "#203253",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#7e8fb1",
      opacity: 1,
    },
  },

  submitBtn: {
    minHeight: 50,
    marginTop: theme.spacing(0.25),
    borderRadius: 16,
    background: `linear-gradient(135deg, ${
      theme.palette.primary.dark || theme.palette.primary.main
    } 0%, ${theme.palette.primary.main} 52%, ${
      theme.palette.primary.light || theme.palette.primary.main
    } 100%)`,
    boxShadow: `0 18px 34px ${alpha(theme.palette.primary.main, 0.28)}`,
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 800,
    textTransform: "none",
    "&:hover": {
      background: `linear-gradient(135deg, ${
        theme.palette.primary.dark || theme.palette.primary.main
      } 0%, ${theme.palette.primary.main} 52%, ${
        theme.palette.primary.light || theme.palette.primary.main
      } 100%)`,
      boxShadow: `0 20px 38px ${alpha(theme.palette.primary.main, 0.34)}`,
    },
  },

  versionBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    color: "#6b7ea4",
    textAlign: "center",
  },

  versionLabel: {
    fontSize: "0.58rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#7f91b4",
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  versionNumber: {
    fontSize: "0.94rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    lineHeight: 1.1,
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },

  footerText: {
    fontSize: "0.72rem",
    lineHeight: 1.45,
    color: "#6f81a4",
    textAlign: "center",
    fontFamily: '"Segoe UI", Inter, Arial, sans-serif',
  },
}));

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const colorModeContext = useContext(ColorModeContext);
  const colorMode = colorModeContext?.colorMode;

  const appName = colorMode?.appName || "CRM Ideia no Bolso";
  const appLogoFavicon = colorMode?.appLogoFavicon || "/favicon.ico";
  const isDarkMode = colorMode?.mode === "dark";
  const badgeTitle = (appName || "CRM Ideia no Bolso").toUpperCase();

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
  const [logoSrc, setLogoSrc] = useState(themeLoginLogo || logo);
  const [systemVersion, setSystemVersion] = useState(packageVersion);
  const [currentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setLogoSrc(themeLoginLogo || logo);
  }, [themeLoginLogo]);

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const { data } = await api.get("/version");
        const version = data?.version || packageVersion;
        setSystemVersion(version);
        localStorage.setItem("frontendVersion", packageVersion);
      } catch (error) {
        setSystemVersion(packageVersion);
      }
    };

    loadVersion();
  }, []);

  const handleChangeInput = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
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
        <section className={classes.leftSide}>
          <div className={classes.leftPanel}>
            <div className={classes.leftBadge}>{badgeTitle}</div>

            <div className={classes.leftOverlayText}>
              <Typography className={classes.leftTitle} component="h1">
                Seu hub de atendimento, WhatsApp e marketing em uma operação só.
              </Typography>

              <Typography className={classes.leftDescription}>
                Organize conversas, campanhas, contatos, setores e performance comercial
                em uma experiência mais clara, ágil e pronta para escalar comunicação.
              </Typography>
            </div>

            <div className={classes.leftHighlights}>
              <div className={classes.highlightCard}>
                <span className={classes.highlightLabel}>Atendimento</span>
                <Typography className={classes.highlightTitle}>
                  Conversas centralizadas no mesmo fluxo
                </Typography>
                <Typography className={classes.highlightText}>
                  Reúna WhatsApp, histórico, contexto do cliente e distribuição da equipe
                  em uma única operação.
                </Typography>
              </div>

              <div className={classes.highlightCard}>
                <span className={classes.highlightLabel}>Produtividade</span>
                <Typography className={classes.highlightTitle}>
                  Atendimento e setor com visão em tempo real
                </Typography>
                <Typography className={classes.highlightText}>
                  Distribua tickets, acompanhe prioridades e mantenha a equipe focada no
                  que precisa de resposta agora.
                </Typography>
              </div>

              <div className={classes.highlightCard}>
                <span className={classes.highlightLabel}>Marketing</span>
                <Typography className={classes.highlightTitle}>
                  CRM, comunicação e campanhas mais conectados
                </Typography>
                <Typography className={classes.highlightText}>
                  Transforme relacionamento em ações comerciais com mais consistência,
                  agilidade e controle da jornada do cliente.
                </Typography>
              </div>
            </div>
          </div>
        </section>

        <section className={classes.rightSide}>
          <IconButton
            className={classes.themeToggle}
            onClick={colorMode?.toggleColorMode}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <WbSunnyIcon /> : <Brightness4Icon />}
          </IconButton>

          <div className={classes.loginShell}>
            <img
              className={classes.logo}
              src={logoSrc}
              alt={appName}
              onError={() => setLogoSrc(logo)}
            />

            <Typography className={classes.heading}>Bem-vindo ao {appName}!</Typography>

            <Typography className={classes.subHeading}>
              Entre com sua conta para acessar o painel com o mesmo visual, identidade e
              organização definidos nas configurações do sistema.
            </Typography>

            <div className={classes.mobileDivider} />

            <div className={classes.formBox}>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  id="email"
                  placeholder="Login *"
                  name="email"
                  value={user.email}
                  onChange={handleChangeInput}
                  className={classes.textField}
                />

                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  placeholder="Senha *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={user.password}
                  onChange={handleChangeInput}
                  className={classes.textField}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Mostrar senha"
                          onClick={() => setShowPassword(prev => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className={classes.submitBtn}
                >
                  Entrar
                </Button>
              </form>
            </div>

            <div className={classes.versionBox}>
              <Typography className={classes.versionLabel}>Versão atual do sistema</Typography>
              <Typography className={classes.versionNumber}>{systemVersion}</Typography>
            </div>

            <Typography className={classes.footerText}>
              CNPJ 64.016.500/0001-02
              <br />
              Desenvolvido por Ideia no Bolso LTDA - {currentYear}
            </Typography>
          </div>
        </section>
      </div>
    </>
  );
};

export default Login;
