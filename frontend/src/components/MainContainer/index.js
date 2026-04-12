import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: 0,
		height: "100%",
		width: "100%",
		maxWidth: "none",
		overflow: "hidden",
		boxSizing: "border-box",
		minWidth: 0,
		minHeight: 0,
	},

	contentWrapper: {
		height: "100%",
		overflowY: "auto",
		overflowX: "hidden",
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2.5),
		gap: theme.spacing(2),
		boxSizing: "border-box",
		width: "100%",
		maxWidth: "100%",
		minWidth: 0,
		minHeight: 0,
		...theme.scrollbarStyles,
		[theme.breakpoints.down("md")]: {
			padding: theme.spacing(2),
			gap: theme.spacing(1.5),
		},
		[theme.breakpoints.down("sm")]: {
			padding: theme.spacing(1.5),
			gap: theme.spacing(1.5),
		},
	},
}));

const MainContainer = ({ children }) => {
	const classes = useStyles();

	return (
		<Container className={classes.mainContainer}>
			<div className={classes.contentWrapper}>{children}</div>
		</Container>
	);
};

export default MainContainer;
