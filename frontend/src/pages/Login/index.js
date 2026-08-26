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

import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import { getBackendUrl } from "../../config";
import logo from "../../assets/logo.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    backgroundColor: "#f2f4f8",
    overflow: "hidden",
  },
  leftSide: {
    flex: 1,
    background: "linear-gradient(145deg, #0b1f56 0%, #0a3da8 50%, #17a7e7 100%)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  leftOverlayText: {
    maxWidth: 560,
    color: "#ffffff",
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 52,
    letterSpacing: "-0.02em",
  },
  rightSide: {
    width: 440,
    minWidth: 440,
    backgroundColor: "#f2f4f8",
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
    gap: 16,
  },
  logo: {
    width: 250,
    maxWidth: "100%",
    height: "auto",
    marginBottom: 6,
  },
  subHeading: {
    textAlign: "center",
    color: "#0f346d",
    fontWeight: 600,
    fontSize: 18,
  },
  cnpj: {
    textAlign: "center",
    color: "#50638a",
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 8,
  },
  formBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    boxShadow: "0 12px 32px rgba(10, 47, 102, 0.10)",
    border: "1px solid #dce4f2",
    padding: "28px 22px",
    minHeight: 350,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#f8fafe",
    },
    "& .MuiInputLabel-root": {
      fontWeight: 600,
      color: "#294370",
      letterSpacing: "0.02em",
    },
  },
  submitWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtn: {
    minWidth: 180,
    borderRadius: 12,
    padding: "10px 24px",
    background: "linear-gradient(90deg, #1d5bcc 0%, #18a6e6 100%)",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    fontSize: 22,
    "&:hover": {
      background: "linear-gradient(90deg, #1548ac 0%, #0e8fca 100%)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();
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
          <Typography className={classes.leftOverlayText}>
            Atendimento, operacao e gestao comercial em um unico painel.
          </Typography>
        </div>

        <div className={classes.rightSide}>
          <Container disableGutters className={classes.card}>
            <img
              src={logoSrc}
              alt={dynamicAppName}
              className={classes.logo}
              onError={() => setLogoSrc(logo)}
            />
            <Typography className={classes.subHeading}>
              Bem-vindo ao CRM Ideia no Bolso!
            </Typography>
            <Typography className={classes.cnpj}>
              CNPJ: 64.016.500/0001-02
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

                <div className={classes.submitWrap}>
                  <Button type="submit" variant="contained" className={classes.submitBtn}>
                    Entrar
                  </Button>
                </div>
              </form>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};

export default Login;
