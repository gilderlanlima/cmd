import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
// import MessageModal from "../../components/MessageModal"
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import EventNoteIcon from "@material-ui/icons/EventNote";
import TodayIcon from "@material-ui/icons/Today";

import "./Schedules.css"; // Importe o arquivo CSS

// Defina a função getUrlParam antes de usá-la
function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px", // Defina um tamanho de fonte menor
  overflow: "hidden", // Oculte qualquer conteúdo excedente
  whiteSpace: "nowrap", // Evite a quebra de linha do texto
  textOverflow: "ellipsis", // Exiba "..." se o texto for muito longo
};

const localizer = momentLocalizer(moment);
var defaultMessages = {
  date: i18n.t("schedules.date"),
  time: i18n.t("schedules.time"),
  event: i18n.t("schedules.event"),
  allDay: i18n.t("schedules.allDay"),
  week: i18n.t("schedules.week"),
  work_week: i18n.t("schedules.work_week"),
  day: i18n.t("schedules.day"),
  month: i18n.t("schedules.month"),
  previous: i18n.t("schedules.previous"),
  next: i18n.t("schedules.next"),
  yesterday: i18n.t("schedules.yesterday"),
  tomorrow: i18n.t("schedules.tomorrow"),
  today: i18n.t("schedules.today"),
  agenda: i18n.t("schedules.agenda"),
  noEventsInRange: i18n.t("schedules.noEventsInRange"),
  showMore: function showMore(total) {
    return "+" + total + " mais";
  },
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    const schedules = action.payload;
    const newSchedules = [];

    schedules.forEach((schedule) => {
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
      } else {
        newSchedules.push(schedule);
      }
    });

    return [...state, ...newSchedules];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;

    const scheduleIndex = state.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex !== -1) {
      state.splice(scheduleIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    borderRadius: 24,
    border: "1px solid rgba(37, 99, 235, 0.08)",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    background:
      theme.mode === "light"
        ? "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)"
        : theme.palette.background.paper,
  },
  heroPanel: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.75, 2),
    borderRadius: 24,
    color: theme.mode === "light" ? "#0f172a" : theme.palette.text.primary,
    background:
      theme.mode === "light"
        ? "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.08) 100%)"
        : theme.palette.background.paper,
    border: "1px solid rgba(37,99,235,0.08)",
  },
  heroTitle: {
    fontWeight: 800,
    marginBottom: theme.spacing(0.35),
    fontSize: "0.98rem",
  },
  heroSubtitle: {
    color: theme.palette.text.secondary,
    maxWidth: 760,
    lineHeight: 1.45,
    fontSize: "0.84rem",
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.25),
  },
  metricCard: {
    padding: theme.spacing(1.1, 1.25),
    borderRadius: 16,
    background: theme.mode === "light" ? "#fff" : "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.16)",
  },
  metricLabel: {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    marginBottom: theme.spacing(0.35),
  },
  metricValue: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    fontSize: "1.05rem",
    fontWeight: 800,
  },
  calendarToolbar: {
    width: "100%",
    minWidth: 0,
    "& .rbc-toolbar": {
      marginBottom: theme.spacing(2),
      gap: theme.spacing(1),
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    "& .rbc-toolbar-label": {
      color: theme.mode === "light" ? "#0f172a" : "white",
      fontWeight: 800,
      fontSize: "1rem",
    },
    "& .rbc-btn-group button": {
      color: theme.mode === "light" ? "#0f172a" : "white",
      borderRadius: 999,
      border: "1px solid rgba(148,163,184,0.28)",
      padding: "8px 14px",
      fontWeight: 700,
      background: theme.mode === "light" ? "#fff" : "transparent",
      "&:hover": {
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
        background: "rgba(37,99,235,0.08)",
      },
      "&:active": {
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
      },
      "&:focus": {
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
      },
      "&.rbc-active": {
        color: "#fff",
        background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
        borderColor: "transparent",
      },
    },
    "& .rbc-calendar": {
      width: "100%",
      minWidth: 0,
    },
    "& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view table": {
      width: "100%",
      minWidth: 0,
    },
    "& .rbc-month-view": {
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(148,163,184,0.16)",
    },
    "& .rbc-header": {
      padding: "4px 6px",
      fontSize: "0.74rem",
      lineHeight: 1.2,
      whiteSpace: "normal",
    },
    "& .rbc-date-cell": {
      paddingRight: 8,
    },
    "& .rbc-month-row": {
      minHeight: 92,
    },
    "& .rbc-event": {
      borderRadius: 14,
      border: "none",
      padding: "4px 8px",
      background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
      boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
    },
    "& .rbc-today": {
      backgroundColor: "rgba(37,99,235,0.06)",
    },
    [theme.breakpoints.down("md")]: {
      "& .rbc-toolbar": {
        alignItems: "stretch",
      },
      "& .rbc-toolbar-label": {
        fontSize: "0.94rem",
      },
      "& .rbc-btn-group button": {
        padding: "7px 12px",
        fontSize: "0.78rem",
      },
      "& .rbc-header": {
        fontSize: "0.68rem",
      },
      "& .rbc-month-row": {
        minHeight: 84,
      },
    },
  },
}));

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useSchedules) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    // handleOpenScheduleModalFromContactId();
    // const socket = socketManager.GetSocket(user.companyId, user.id);

    const onCompanySchedule = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };

    socket.on(`company${user.companyId}-schedule`, onCompanySchedule);

    return () => {
      socket.off(`company${user.companyId}-schedule`, onCompanySchedule);
    };
  }, [socket]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const truncate = (str, len) => {
    if (str.length > len) {
      return str.substring(0, len) + "...";
    }
    return str;
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          reload={fetchSchedules}
          // aria-labelledby="form-dialog-title"
          scheduleId={selectedSchedule ? selectedSchedule.id : null}
          contactId={contactId}
          cleanContact={cleanContact}
          user={user}
        />
      )}
      <MainHeader>
        <Title>
          {i18n.t("schedules.title")} ({schedules.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleModal}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.heroPanel} elevation={0}>
        <div className={classes.heroTitle}>Organize seus agendamentos com mais clareza</div>
        <div className={classes.heroSubtitle}>
          Visualize compromissos, acompanhamentos e lembretes em um calendário mais elegante, limpo e prático para o dia a dia da operação.
        </div>
        <div className={classes.metricsRow}>
          <div className={classes.metricCard}>
            <div className={classes.metricLabel}>Total de agendamentos</div>
            <div className={classes.metricValue}>
              <EventNoteIcon color="primary" />
              {schedules.length}
            </div>
          </div>
          <div className={classes.metricCard}>
            <div className={classes.metricLabel}>Agendamentos do dia</div>
            <div className={classes.metricValue}>
              <TodayIcon color="primary" />
              {schedules.filter((schedule) => moment(schedule.sendAt).isSame(moment(), "day")).length}
            </div>
          </div>
        </div>
      </Paper>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Calendar
          messages={defaultMessages}
          formats={{
            agendaDateFormat: "DD/MM ddd",
            weekdayFormat: "dddd",
          }}
          localizer={localizer}
          events={schedules.map((schedule) => ({
            title: (
              <div key={schedule.id} className="event-container">
                <div style={eventTitleStyle}>{schedule?.contact?.name}</div>
                <DeleteOutlineIcon
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="delete-icon"
                />
                <EditIcon
                  onClick={() => {
                    handleEditSchedule(schedule);
                    setScheduleModalOpen(true);
                  }}
                  className="edit-icon"
                />
              </div>
            ),
            start: new Date(schedule.sendAt),
            end: new Date(schedule.sendAt),
          }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          className={classes.calendarToolbar}
        />
      </Paper>
    </MainContainer>
  );
};

export default Schedules;
