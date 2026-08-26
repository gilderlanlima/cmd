import React, { useState, useCallback, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";

import TicketsManagerTabs from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const defaultTicketsManagerWidth = 550;
const minTicketsManagerWidth = 404;
const maxTicketsManagerWidth = 700;
const compactMinTicketsManagerWidth = 360;
const compactDefaultTicketsManagerWidth = 420;
const compactMaxTicketsManagerWidth = 460;

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    minWidth: 0,
    boxSizing: "border-box",
    padding: theme.spacing(1),
    height: "100%",
    minHeight: 0,
    overflowY: "hidden",
    overflowX: "hidden",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5),
    },
  },
  chatPapper: {
    display: "flex",
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  },
  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    overflowX: "hidden",
    flexShrink: 0,
    position: "relative",
    minWidth: `${minTicketsManagerWidth}px`,
    "@media (max-width: 1366px)": {
      minWidth: `${compactMinTicketsManagerWidth}px`,
    },
  },
  messagesWrapper: {
    display: "flex",
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    flexDirection: "column",
    flexGrow: 1,
    overflowX: "hidden",
  },
  welcomeMsg: {
    background: theme.palette.tabHeaderBackground,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  dragger: {
    width: 5,
    cursor: "ew-resize",
    padding: "4px 0 0",
    borderTop: "1px solid #ddd",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#f4f7f9",
    userSelect: "none",
    "@media (max-width: 1366px)": {
      width: 4,
    },
  },
  logo: {
    logo: theme.logo,
    content:
      "url(" +
      (theme.mode === "light"
        ? theme.calculatedLogoLight()
        : theme.calculatedLogoDark()) +
      ")",
  },
}));

const TicketsCustom = () => {
  const { user } = useContext(AuthContext);
  const { ticketId } = useParams();
  const compactLaptop = useMediaQuery("(max-width:1366px)");
  const [ticketsManagerWidth, setTicketsManagerWidth] = useState(
    compactLaptop
      ? compactDefaultTicketsManagerWidth
      : user?.defaultTicketsManagerWidth || defaultTicketsManagerWidth
  );
  const classes = useStyles();
  const ticketsManagerWidthRef = useRef(ticketsManagerWidth);

  const getWidthBounds = useCallback(() => {
    if (compactLaptop) {
      return {
        min: compactMinTicketsManagerWidth,
        max: compactMaxTicketsManagerWidth,
        preferred: Math.min(
          user?.defaultTicketsManagerWidth || compactDefaultTicketsManagerWidth,
          compactDefaultTicketsManagerWidth
        ),
      };
    }

    return {
      min: minTicketsManagerWidth,
      max: maxTicketsManagerWidth,
      preferred: user?.defaultTicketsManagerWidth || defaultTicketsManagerWidth,
    };
  }, [compactLaptop, user?.defaultTicketsManagerWidth]);

  useEffect(() => {
    const { min, max, preferred } = getWidthBounds();
    const validWidth = Math.max(min, Math.min(max, preferred));

    setTicketsManagerWidth(validWidth);
    ticketsManagerWidthRef.current = validWidth;
  }, [getWidthBounds]);

  const handleMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleSaveContact = async (value) => {
    const { min } = getWidthBounds();
    const validValue = Math.max(min, value);

    try {
      await api.put(`/users/toggleChangeWidht/${user.id}`, {
        defaultTicketsManagerWidth: validValue,
      });
    } catch (error) {
      console.error("Erro ao salvar largura:", error);
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      const { min, max } = getWidthBounds();
      const newWidth = e.clientX - document.body.offsetLeft;

      if (newWidth >= min && newWidth <= max) {
        ticketsManagerWidthRef.current = newWidth;
        setTicketsManagerWidth(newWidth);
      }
    },
    [getWidthBounds]
  );

  const handleMouseUp = async () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);

    const newWidth = ticketsManagerWidthRef.current;

    if (newWidth !== ticketsManagerWidth) {
      await handleSaveContact(newWidth);
    }
  };

  const { min, max } = getWidthBounds();
  const effectiveWidth = Math.max(min, Math.min(max, ticketsManagerWidth));

  return (
    <QueueSelectedProvider>
      <div className={classes.chatContainer}>
        <div className={classes.chatPapper}>
          <div
            className={classes.contactsWrapper}
            style={{
              width: `${effectiveWidth}px`,
              minWidth: `${min}px`,
              maxWidth: `${max}px`,
              opacity: effectiveWidth > 0 ? 1 : 0,
              visibility: effectiveWidth > 0 ? "visible" : "hidden",
            }}
          >
            <TicketsManagerTabs />
            <div onMouseDown={handleMouseDown} className={classes.dragger} />
          </div>

          <div className={classes.messagesWrapper}>
            {ticketId ? (
              <Ticket />
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper square variant="outlined" className={classes.welcomeMsg}>
                  <span>
                    <center>
                      <img className={classes.logo} width={compactLaptop ? "42%" : "50%"} alt="" />
                    </center>
                  </span>
                </Paper>
              </Hidden>
            )}
          </div>
        </div>
      </div>
    </QueueSelectedProvider>
  );
};

export default TicketsCustom;
