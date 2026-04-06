import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: 0,
		height: `calc(100% - 48px)`,
		width: "100%",
		maxWidth: "none",
		minWidth: 0,
	},

	contentWrapper: {
		height: "100%",
		overflowY: "hidden",
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2.5),
		gap: theme.spacing(2),
		boxSizing: "border-box",
		minWidth: 0,
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
