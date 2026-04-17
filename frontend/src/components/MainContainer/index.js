import React from "react";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { styled } from "goober";

const ContentShell = styled("div")`
	height: 100%;
	overflow-y: hidden;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	min-width: 0;
	border-radius: 18px;
	background:
		linear-gradient(
			180deg,
			${props =>
				props.$isLight ? "rgba(255, 255, 255, 0.88)" : "rgba(17, 24, 39, 0.92)"} 0%,
			${props =>
				props.$isLight ? "rgba(255, 255, 255, 0.72)" : "rgba(15, 23, 42, 0.82)"} 100%
		);
	border: 1px solid
		${props =>
			props.$isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(148, 163, 184, 0.14)"};
	box-shadow: 0 20px 45px
		${props =>
			props.$isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(2, 6, 23, 0.34)"};
	backdrop-filter: blur(8px);
`;

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
		padding: theme.spacing(2.5),
		gap: theme.spacing(2),
		[theme.breakpoints.down("sm")]: {
			padding: theme.spacing(1.5),
			gap: theme.spacing(1.5),
		},
	},
}));

const MainContainer = ({ children }) => {
	const classes = useStyles();
	const theme = useTheme();

	return (
		<Container className={classes.mainContainer}>
			<ContentShell
				className={classes.contentWrapper}
				$isLight={theme.mode === "light"}
			>
				{children}
			</ContentShell>
		</Container>
	);
};

export default MainContainer;
