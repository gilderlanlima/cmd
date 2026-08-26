import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IconButton,
  Typography,
  Fade,
  Paper,
} from "@material-ui/core";
import {
  FiberManualRecord as DotIcon,
  Close as CloseIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const packageVersion = require("../../../package.json").version;

const useStyles = makeStyles((theme) => ({
  banner: {
    position: "fixed",
    top: 64,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: theme.zIndex.drawer + 2,
    borderRadius: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    backgroundColor: theme.palette.type === "dark" ? "#2b2b2b" : "#26313d",
    color: "rgba(255,255,255,0.92)",
    padding: theme.spacing(0.5, 1, 0.5, 1.5),
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    maxWidth: "94vw",
    fontSize: 13,
  },
  dot: {
    fontSize: 8,
    color: theme.palette.success.light,
    marginRight: theme.spacing(1),
    flexShrink: 0,
  },
  text: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  link: {
    marginLeft: theme.spacing(1.5),
    fontWeight: 600,
    cursor: "pointer",
    color: theme.palette.info.light,
    flexShrink: 0,
    "&:hover": {
      textDecoration: "underline",
    },
  },
  closeButton: {
    marginLeft: theme.spacing(0.5),
    padding: 4,
    color: "rgba(255,255,255,0.6)",
    flexShrink: 0,
  },
}));

const VersionControl = () => {
  const classes = useStyles();
  const history = useHistory();
  const [storedVersion] = useState(
    window.localStorage.getItem("version") || "4.7.7"
  );
  const [showBanner, setShowBanner] = useState(false);

  const hasNewVersion = storedVersion !== packageVersion;

  useEffect(() => {
    if (hasNewVersion) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasNewVersion]);

  const handleGoToUpdate = () => {
    window.localStorage.setItem("version", packageVersion);
    setShowBanner(false);
    history.push("/settings?tab=systemUpdate");
  };

  if (!hasNewVersion) {
    return null;
  }

  return (
    <Fade in={showBanner}>
      <Paper className={classes.banner} elevation={0}>
        <DotIcon className={classes.dot} />
        <Typography variant="body2" className={classes.text}>
          Nova versão disponível
        </Typography>
        <span className={classes.link} onClick={handleGoToUpdate}>
          Ver atualização
        </span>
        <IconButton
          size="small"
          className={classes.closeButton}
          onClick={() => setShowBanner(false)}
        >
          <CloseIcon style={{ fontSize: 14 }} />
        </IconButton>
      </Paper>
    </Fade>
  );
};

export default VersionControl;