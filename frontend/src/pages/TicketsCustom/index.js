import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManagerTabs from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import Chat from "../Chat";

const useStyles = makeStyles((theme) => ({
	chatContainer: {
		flex: 1,
		padding: "2px",
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
		overflowX: "hidden",
	},
	chatPapper: {
		display: "flex",
		height: "100%",
		gap: 0,
		overflowX: "hidden",
	},
	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
		overflowX: "hidden",
		position: "relative",
		flex: "0 0 40%",
		width: "40%",
		minWidth: 0,
		maxWidth: "40%",
	},
	messagesWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		flex: "0 0 60%",
		width: "60%",
		minWidth: 0,
		maxWidth: "60%",
		overflowX: "hidden",
	},
	welcomeMsg: {
		background: theme.palette.tabHeaderBackground,
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	logo: {
		logo: theme.logo,
		content:
			"url(" +
			(theme.mode === "light"
				? theme.calculatedLogoLight()
				: theme.calculatedLogoDark()) +
			")",
	},
	"@media (max-width: 1366px)": {
		contactsWrapper: {
			flex: "0 0 40%",
			width: "40%",
			minWidth: 0,
			maxWidth: "40%",
		},
		messagesWrapper: {
			flex: "0 0 60%",
			width: "60%",
			minWidth: 0,
			maxWidth: "60%",
		},
	},
}));

const TicketsCustom = () => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const { tabOpen } = useContext(TicketsContext);

	return (
		<QueueSelectedProvider>
			<div className={classes.chatContainer}>
				<div className={classes.chatPapper}>
					<div className={classes.contactsWrapper}>
						<TicketsManagerTabs />
					</div>
					<div className={classes.messagesWrapper}>
						{tabOpen === "chat-internal" ? (
							<Chat embedded />
						) : ticketId ? (
							<Ticket />
						) : (
							<Hidden only={["sm", "xs"]}>
								<Paper square variant="outlined" className={classes.welcomeMsg}>
									<span>
										<center>
											<img className={classes.logo} width="50%" alt="" />
										</center>
									</span>
								</Paper>
							</Hidden>
						)}
					</div>
				</div>
			</div>
		</QueueSelectedProvider>
	);
};

export default TicketsCustom;
