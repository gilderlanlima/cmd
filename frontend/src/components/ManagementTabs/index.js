import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Tab, Tabs } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: "100%",
    marginBottom: theme.spacing(2),
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.mode === "light"
        ? "0 8px 24px rgba(15, 23, 42, 0.06)"
        : "0 8px 24px rgba(0, 0, 0, 0.24)",
  },
  tabsRoot: {
    minHeight: 52,
    backgroundColor: theme.palette.background.paper,
  },
  indicator: {
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.palette.primary.main,
  },
  tabRoot: {
    minHeight: 52,
    textTransform: "none",
    fontWeight: 700,
    fontSize: 14,
  },
}));

const managementTabs = [
  { label: "Dashboard", path: "/" },
  { label: "Relatórios", path: "/reports" },
  { label: "Painel", path: "/moments" },
];

const getTabValue = (pathname) => {
  const currentTab = managementTabs.find((item) => item.path === pathname);
  return currentTab ? currentTab.path : "/";
};

const ManagementTabs = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const handleChange = (_, value) => {
    if (value !== location.pathname) {
      history.push(value);
    }
  };

  return (
    <Paper className={classes.wrapper} elevation={0}>
      <Tabs
        value={getTabValue(location.pathname)}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        classes={{ root: classes.tabsRoot, indicator: classes.indicator }}
      >
        {managementTabs.map((item) => (
          <Tab
            key={item.path}
            value={item.path}
            label={item.label}
            className={classes.tabRoot}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default ManagementTabs;
