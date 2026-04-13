import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
  makeStyles
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { normalizeBackendAssetUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflow: "hidden",
    minHeight: 680,
    backgroundColor: theme.palette.background.paper
  },
  sidebar: {
    height: "100%",
    overflowY: "auto",
    borderRight: `1px solid ${theme.palette.divider}`,
    paddingRight: theme.spacing(1)
  },
  sidebarEmpty: {
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
    textAlign: "left"
  },
  previewColumn: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)"
  },
  phoneFrame: {
    width: 320,
    maxWidth: "100%",
    height: 620,
    margin: "0 auto",
    borderRadius: 32,
    background: "#111827",
    padding: 10,
    boxShadow: "0 18px 50px rgba(0,0,0,0.25)"
  },
  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    background: "#000",
    overflow: "hidden",
    position: "relative"
  },
  storyMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  storyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    background: "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0))",
    color: "#fff",
    zIndex: 2
  },
  storyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    background: "linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))",
    color: "#fff",
    zIndex: 2
  },
  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
    padding: theme.spacing(3)
  },
  textStory: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#fff",
    padding: theme.spacing(4),
    background: "linear-gradient(180deg, #1d4ed8 0%, #312e81 100%)"
  },
  storyStepper: {
    marginTop: theme.spacing(2)
  }
}));

const groupStories = stories => {
  const groups = new Map();

  stories.forEach(story => {
    const key = story.author?.key || story.user?.id || story.userId || `story-${story.id}`;
    const current = groups.get(key);
    if (current) {
      current.items.push(story);
    } else {
      groups.set(key, {
        key,
        author: story.author || {
          name: story.user?.name || "Story",
          avatar: story.user?.profileImage || null
        },
        items: [story]
      });
    }
  });

  return Array.from(groups.values());
};

const Stories = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStories = async () => {
    try {
      const { data } = await api.get("/stories");
      setStories(data || []);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    const companyChannel = `company-${user.companyId}-story`;

    const handleStoryEvent = event => {
      if (event.action === "create") {
        setStories(prev => [event.record, ...prev]);
        return;
      }

      if (event.action === "delete") {
        setStories(prev => prev.filter(item => item.id !== event.id));
      }
    };

    socket.on(companyChannel, handleStoryEvent);
    return () => {
      socket.off(companyChannel, handleStoryEvent);
    };
  }, [socket, user.companyId]);

  const storyGroups = useMemo(() => groupStories(stories), [stories]);
  const selectedGroup =
    storyGroups.find(group => group.key === selectedGroupKey) || storyGroups[0] || null;
  const currentStory = selectedGroup?.items?.[selectedIndex] || null;

  useEffect(() => {
    if (storyGroups.length && selectedGroupKey === null) {
      setSelectedGroupKey(storyGroups[0].key);
      setSelectedIndex(0);
    }
  }, [storyGroups, selectedGroupKey]);

  const resetDialog = () => {
    setCaption("");
    setExpiresAt("");
    setFile(null);
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!file || !expiresAt) {
      toast.error("Selecione o arquivo e a data de expiracao");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("expiresAt", expiresAt);
    formData.append("typeArch", "stories");
    formData.append("userId", String(user.id));

    try {
      setSubmitting(true);
      await api.post("/stories", formData);
      toast.success("Story publicado com sucesso");
      resetDialog();
      loadStories();
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async storyId => {
    try {
      await api.delete(`/stories/${storyId}`);
      toast.success("Story removido");
      loadStories();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <Dialog open={dialogOpen} onClose={resetDialog} fullWidth maxWidth="sm">
        <DialogTitle>Publicar story</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={event => setFile(event.target.files?.[0] || null)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legenda"
                value={caption}
                onChange={event => setCaption(event.target.value)}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expira em"
                value={expiresAt}
                onChange={event => setExpiresAt(event.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={submitting}>
            Publicar
          </Button>
        </DialogActions>
      </Dialog>

      <MainHeader>
        <Title>Stories</Title>
        <MainHeaderButtonsWrapper>
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Novo story
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={12} md={4} lg={3}>
            <div className={classes.sidebar}>
              {storyGroups.length ? (
                <List>
                  {storyGroups.map(group => (
                    <ListItem
                      button
                      key={group.key}
                      selected={selectedGroup?.key === group.key}
                      onClick={() => {
                        setSelectedGroupKey(group.key);
                        setSelectedIndex(0);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={normalizeBackendAssetUrl(group.author?.avatar)}>
                          {(group.author?.name || "?").charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.author?.name || "Story"}
                        secondary={`${group.items.length} story${group.items.length > 1 ? "s" : ""}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <div className={classes.sidebarEmpty}>
                  <Typography variant="h6" gutterBottom>
                    Nenhum story no painel
                  </Typography>
                  <Typography variant="body2">
                    Quando um story for publicado por aqui, ele aparece nesta lista para visualizacao.
                  </Typography>
                </div>
              )}
            </div>
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <div className={classes.previewColumn}>
              <div>
                <div className={classes.phoneFrame}>
                  <div className={classes.phoneScreen}>
                    {currentStory ? (
                      <>
                        <div className={classes.storyHeader}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <Avatar src={normalizeBackendAssetUrl(currentStory.author?.avatar)}>
                                {(currentStory.author?.name || "?").charAt(0)}
                              </Avatar>
                            </Grid>
                            <Grid item xs>
                              <Typography variant="subtitle2">
                                {currentStory.author?.name || "Story"}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(currentStory.createdAt).toLocaleString("pt-BR")}
                              </Typography>
                            </Grid>
                            {(user.profile === "admin" || currentStory.userId === user.id) && (
                              <Grid item>
                                <IconButton
                                  style={{ color: "#fff" }}
                                  onClick={() => handleDelete(currentStory.id)}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Grid>
                            )}
                          </Grid>
                        </div>

                        {!currentStory.mediaUrl ? (
                          <div className={classes.textStory}>
                            <Typography variant="h5">
                              {currentStory.caption || "Story sem midia"}
                            </Typography>
                          </div>
                        ) : String(currentStory.mediaType || "").startsWith("video/") ? (
                          <video
                            className={classes.storyMedia}
                            src={normalizeBackendAssetUrl(currentStory.mediaUrl || currentStory.mediaPath)}
                            controls
                          />
                        ) : (
                          <img
                            className={classes.storyMedia}
                            src={normalizeBackendAssetUrl(currentStory.mediaUrl || currentStory.mediaPath)}
                            alt={currentStory.caption || "Story"}
                          />
                        )}

                        <div className={classes.storyFooter}>
                          <Typography variant="body2">
                            {currentStory.caption || "Sem legenda"}
                          </Typography>
                        </div>
                      </>
                    ) : (
                      <div className={classes.emptyState}>
                        <Typography variant="h6">Nenhum story publicado</Typography>
                        <Typography variant="body2">
                          Publique o primeiro story para visualizar no formato de celular.
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>

                {selectedGroup && selectedGroup.items.length > 1 && (
                  <Grid
                    container
                    spacing={1}
                    justifyContent="center"
                    className={classes.storyStepper}
                  >
                    {selectedGroup.items.map((story, index) => (
                      <Grid item key={story.id}>
                        <Button
                          size="small"
                          variant={index === selectedIndex ? "contained" : "outlined"}
                          color="primary"
                          onClick={() => setSelectedIndex(index)}
                        >
                          {index + 1}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default Stories;
