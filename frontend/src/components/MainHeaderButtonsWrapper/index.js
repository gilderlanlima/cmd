import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	MainHeaderButtonsWrapper: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		alignItems: "center",
		flex: "0 1 auto",
		marginLeft: "auto",
		maxWidth: "100%",
		minWidth: 0,
		rowGap: theme.spacing(1),
		columnGap: theme.spacing(1),
		boxSizing: "border-box",
		"& > *": {
			margin: 0,
		},
	},
}));

const MainHeaderButtonsWrapper = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;
