import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { FormControl, InputLabel, Select, MenuItem, Typography } from "@material-ui/core";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MoreHoriz } from "@material-ui/icons";
import ContactTagListModal from "../../components/ContactTagListModal";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS":
      const tag = action.payload;
      const tagIndex = state.findIndex((s) => s.id === tag.id);

      if (tagIndex !== -1) {
        state[tagIndex] = tag;
        return [...state];
      } else {
        return [tag, ...state];
      }
    case "DELETE_TAGS":
      const tagId = action.payload;
      return state.filter((tag) => tag.id !== tagId);
    case "RESET":
      return [];
    case "SET_TAGS":
      return action.payload;
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  orderingPanel: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: theme.palette.background.default,
  },
  orderingHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  orderingHint: {
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
  },
  orderingList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  orderingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 14,
    background: theme.palette.background.paper,
    border: "1px solid rgba(0,0,0,0.08)",
  },
  orderingItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    minWidth: 0,
  },
  dragHandle: {
    color: theme.palette.text.secondary,
    cursor: "grab",
  },
  orderingIndex: {
    minWidth: 26,
    height: 26,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(37,99,235,0.12)",
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "0.78rem",
  },
  orderingName: {
    fontWeight: 700,
  }
}));

const Tags = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [selectedTagContacts, setSelectedTagContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [selectedTagName, setSelectedTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const pageNumberRef = useRef(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchMoreTags = async () => {
        try {
          const { data } = await api.get("/tags/", {
            params: { searchParam, pageNumber, kanban: 0, limit: pageSize },
          });
          dispatch({ type: "LOAD_TAGS", payload: data.tags });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };

      if (pageNumber > 0) {
        setLoading(true);
        fetchMoreTags();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, pageSize]);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
      if (data.action === "reorder") {
        dispatch({ type: "SET_TAGS", payload: data.tags });
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);

    return () => {
      socket.off(`company${user.companyId}-tag`, onCompanyTags);
    };
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleShowContacts = (contacts, tag) => {
    setSelectedTagContacts(contacts);
    setContactModalOpen(true);
    setSelectedTagName(tag);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedTagContacts([]);
    setSelectedTagName("");
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const reorderTags = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const reordered = reorderTags(tags, result.source.index, result.destination.index);
    dispatch({ type: "SET_TAGS", payload: reordered });

    try {
      setSavingOrder(true);
      const { data } = await api.post("/tags/reorder", {
        orderedIds: reordered.map(tag => tag.id)
      });
      dispatch({ type: "SET_TAGS", payload: data.tags });
      toast.success("Ordem das tags atualizada com sucesso.");
    } catch (err) {
      toastError(err);
      dispatch({ type: "RESET" });
      setPageNumber(1);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      {contactModalOpen && (
        <ContactTagListModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          tag={selectedTagName}
        />
      )}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />
      <MainHeader>
        <Title>{i18n.t("tags.title")} ({tags.length})</Title>
        <MainHeaderButtonsWrapper>
            <FormControl variant="outlined" size="small" style={{ minWidth: 140 }}>
              <InputLabel id="page-size-label">Itens/página</InputLabel>
              <Select
                labelId="page-size-label"
                value={pageSize}
                onChange={handlePageSizeChange}
                label="Itens/página"
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
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
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      {!searchParam && tags.length > 0 && (
        <Paper className={classes.orderingPanel} elevation={0}>
          <div className={classes.orderingHeader}>
            <div>
              <Typography variant="h6">Ordem das tags nos Tickets</Typography>
              <Typography className={classes.orderingHint}>
                Arraste para reorganizar. Essa ordem será refletida na separação visual dos tickets.
              </Typography>
            </div>
            {savingOrder && <Typography className={classes.orderingHint}>Salvando ordem...</Typography>}
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tags-order">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classes.orderingList}
                >
                  {tags.map((tag, index) => (
                    <Draggable key={String(tag.id)} draggableId={String(tag.id)} index={index}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={classes.orderingItem}
                        >
                          <div className={classes.orderingItemLeft}>
                            <div {...dragProvided.dragHandleProps} className={classes.dragHandle}>
                              <DragIndicatorIcon />
                            </div>
                            <span className={classes.orderingIndex}>{index + 1}</span>
                            <Chip
                              size="small"
                              label={tag.name}
                              style={{
                                backgroundColor: tag.color || "#94A3B8",
                                color: "#fff",
                                fontWeight: 700
                              }}
                            />
                          </div>
                          <Typography className={classes.orderingName}>
                            {tag.name}
                          </Typography>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      )}
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("tags.table.id")}</TableCell>
              <TableCell align="center">{i18n.t("tags.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.contacts")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell align="center">{tag.id}</TableCell>
                  <TableCell align="center">
                    <Chip
                      variant="outlined"
                      style={{
                        backgroundColor: tag.color,
                        textShadow: "1px 1px #000",
                        color: "white",
                      }}
                      label={tag.name}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {tag?.contacts?.length}
                    <IconButton
                      size="small"
                      onClick={() => handleShowContacts(tag?.contacts, tag)}
                      disabled={tag?.contacts?.length === 0}
                    >
                      <MoreHoriz />
                    </IconButton>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditTag(tag)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingTag(tag);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {loading && Array.from({ length: 5 }).map((_, idx) => (
                <TableRowSkeleton key={`skeleton-${idx}`} columns={4} />
              ))}
            </>
          </TableBody>
        </Table>
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
            <Button variant="outlined" color="primary" onClick={loadMore} disabled={loading}>
              {loading ? i18n.t("contacts.loading") : i18n.t("contacts.loadMore")}
            </Button>
          </div>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Tags;
