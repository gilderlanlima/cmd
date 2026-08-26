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
		// Sem overflow proprio de proposito: se um eixo for declarado
		// diferente do outro aqui, o CSS forca o eixo "visible" a virar
		// "auto" (vira scroll duplicado). O <main> do layout ja cuida do
		// scroll vertical e do overflow-x:hidden horizontal.
		boxSizing: "border-box",
		minWidth: 0,
	},

	contentWrapper: {
		// O scroll da página é do <main> do layout (envolve toda página
		// autenticada) - esse wrapper nao deve rolar de novo por conta
		// propria, senao gera barra de rolagem duplicada.
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2.5),
		gap: theme.spacing(2),
		boxSizing: "border-box",
		width: "100%",
		maxWidth: "100%",
		minWidth: 0,
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
