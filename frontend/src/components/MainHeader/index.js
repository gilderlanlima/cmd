import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	contactsHeader: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(1, 1, 2, 1),
		gap: theme.spacing(2),
		[theme.breakpoints.down("sm")]: {
			padding: theme.spacing(0.5, 0.5, 1.5, 0.5),
			gap: theme.spacing(1),
		},
	},
}));

const MainHeader = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.contactsHeader}>{children}</div>;
};

export default MainHeader;
