import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import LockIcon from "@material-ui/icons/Lock";

import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import { getBackendUrl } from "../../config";
import logo from "../../assets/logo.png";

const packageVersion = require("../../../package.json").version;

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    backgroundColor: "#f5f6fc",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  leftSide: {
    flex: 1,
    background:
      "linear-gradient(155deg, #150a35 0%, #3f1f8f 42%, #0891b2 100%)",
    backgroundImage:
      "radial-gradient(circle at 22px 22px, rgba(255,255,255,0.09) 2px, transparent 2px), " +
      "linear-gradient(155deg, #150a35 0%, #3f1f8f 42%, #0891b2 100%)",
    backgroundSize: "44px 44px, cover",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "56px",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  leftGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,211,238,0.35) 0%, rgba(34,211,238,0) 70%)",
    bottom: -140,
    left: -100,
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 560,
  },
  leftEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#67e8f9",
    fontFamily: "'Roboto Mono', monospace",
    fontSize: 12.5,
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 20,
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid rgba(103, 232, 249, 0.35)",
    backgroundColor: "rgba(103, 232, 249, 0.08)",
  },
  leftOverlayText: {
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    lineHeight: 1.15,
    fontSize: 44,
    letterSpacing: "-0.02em",
  },
  leftSubtext: {
    color: "rgba(226, 232, 255, 0.75)",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.6,
    marginTop: 20,
    maxWidth: 440,
  },
  rightSide: {
    width: 440,
    minWidth: 440,
    backgroundColor: "#f5f6fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      minWidth: "100%",
    },
  },
  card: {
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  logo: {
    width: 250,
    maxWidth: "100%",
    height: "auto",
    marginBottom: 4,
  },
  welcomeGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  subHeading: {
    textAlign: "center",
    color: "#1e1b4b",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 21,
    letterSpacing: "-0.01em",
  },
  subHeadingCaption: {
    textAlign: "center",
    color: "#767a99",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 13.5,
  },
  formBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(79, 70, 229, 0.12)",
    border: "1px solid #e5e7f5",
    padding: "30px 26px",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#f8f8fd",
      fontSize: 15,
      fontFamily: "'Inter', sans-serif",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#4f46e5",
        borderWidth: 2,
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 14px",
    },
    "& .MuiInputLabel-outlined": {
      fontSize: 15,
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      color: "#3730a3",
      letterSpacing: "0.01em",
      "&.Mui-focused": {
        color: "#4f46e5",
      },
    },
  },
  submitBtn: {
    width: "100%",
    borderRadius: 10,
    padding: "9px 24px",
    minHeight: "auto",
    background: "linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    textTransform: "none",
    fontSize: 14.5,
    letterSpacing: "0.01em",
    boxShadow: "0 10px 24px rgba(79, 70, 229, 0.30)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      background: "linear-gradient(90deg, #4338ca 0%, #0891b2 100%)",
      boxShadow: "0 12px 28px rgba(79, 70, 229, 0.38)",
      transform: "translateY(-1px)",
    },
  },
  securitySeal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    color: "#8385a8",
    fontFamily: "'Roboto Mono', monospace",
    fontSize: 11,
    fontWeight: 400,
    marginTop: 4,
  },
  sealIcon: {
    fontSize: 14,
    color: "#0d9488",
  },
  version: {
    color: "#a3a6c2",
    fontFamily: "'Roboto Mono', monospace",
    fontSize: 11,
    fontWeight: 400,
    marginTop: 6,
    letterSpacing: "0.02em",
  },
}));

const Login = () => {
  const classes = useStyles();
  const isSecureConnection =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const { handleLogin } = useContext(AuthContext);
  const { getPublicSetting } = useSettings();
  const colorModeContext = useContext(ColorModeContext);
  const colorMode = colorModeContext?.colorMode;
  const isDarkMode = colorMode?.mode === "dark";
  const [dynamicAppName, setDynamicAppName] = useState(
    colorMode?.appName || "CRM Ideia no Bolso"
  );
  const [dynamicAppLogoFavicon, setDynamicAppLogoFavicon] = useState(
    colorMode?.appLogoFavicon || "/favicon.ico"
  );
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

  useEffect(() => {
    setLogoSrc(themeLoginLogo || logo);
  }, [themeLoginLogo]);

  useEffect(() => {
    let isMounted = true;

    const resolveAssetUrl = (fileName, fallbackValue) => {
      if (!fileName) {
        return fallbackValue;
      }

      return `${getBackendUrl().replace(/\/$/, "")}/public/${fileName}`;
    };

    const loadBranding = async () => {
      try {
        const [
          appNameSetting,
          appLogoLightSetting,
          appLogoDarkSetting,
          appLogoFaviconSetting,
        ] = await Promise.all([
          getPublicSetting("appName"),
          getPublicSetting("appLogoLight"),
          getPublicSetting("appLogoDark"),
          getPublicSetting("appLogoFavicon"),
        ]);

        if (!isMounted) {
          return;
        }

        const preferredLogoSetting = isDarkMode
          ? appLogoDarkSetting || appLogoLightSetting
          : appLogoLightSetting || appLogoDarkSetting;

        setDynamicAppName(appNameSetting || colorMode?.appName || "CRM Ideia no Bolso");
        setDynamicAppLogoFavicon(
          resolveAssetUrl(
            appLogoFaviconSetting,
            colorMode?.appLogoFavicon || "/favicon.ico"
          )
        );
        setLogoSrc(resolveAssetUrl(preferredLogoSetting, themeLoginLogo || logo));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDynamicAppName(colorMode?.appName || "CRM Ideia no Bolso");
        setDynamicAppLogoFavicon(colorMode?.appLogoFavicon || "/favicon.ico");
        setLogoSrc(themeLoginLogo || logo);
      }
    };

    loadBranding();

    return () => {
      isMounted = false;
    };
  }, [
    colorMode?.appLogoFavicon,
    colorMode?.appName,
    getPublicSetting,
    isDarkMode,
    themeLoginLogo,
  ]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>{dynamicAppName}</title>
        <link rel="icon" href={dynamicAppLogoFavicon} />
      </Helmet>

      <div className={classes.root}>
        <div className={classes.leftSide}>
          <div className={classes.leftGlow} />
          <div className={classes.leftContent}>
            <span className={classes.leftEyebrow}>
              <LockIcon style={{ fontSize: 13 }} />
              Plataforma inteligente de atendimento
            </span>
            <Typography className={classes.leftOverlayText}>
              Atendimento, operação e gestão comercial em um único painel.
            </Typography>
            <Typography className={classes.leftSubtext}>
              Automatize conversas, organize sua equipe e acompanhe resultados
              em tempo real — tudo em uma única plataforma.
            </Typography>
          </div>
        </div>

        <div className={classes.rightSide}>
          <Container disableGutters className={classes.card}>
            <img
              src={logoSrc}
              alt={dynamicAppName}
              className={classes.logo}
              onError={() => setLogoSrc(logo)}
            />
            <div className={classes.welcomeGroup}>
              <Typography className={classes.subHeading}>
                Bem-vindo de volta
              </Typography>
              <Typography className={classes.subHeadingCaption}>
                Entre com sua conta do {dynamicAppName}
              </Typography>
            </div>

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
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button type="submit" variant="contained" className={classes.submitBtn}>
                  Entrar
                </Button>
              </form>
            </div>

            {isSecureConnection && (
              <div className={classes.securitySeal}>
                <LockIcon className={classes.sealIcon} />
                <span>Conexão segura e criptografada (HTTPS/TLS)</span>
              </div>
            )}
            <Typography className={classes.version}>
              Versão {packageVersion}
            </Typography>
          </Container>
        </div>
      </div>
    </>
  );
};

export default Login;
