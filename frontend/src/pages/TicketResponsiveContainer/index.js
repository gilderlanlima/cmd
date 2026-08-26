import React from "react";
import { useTheme, useMediaQuery } from "@material-ui/core";

import Tickets from "../TicketsCustom"
import TicketAdvanced from "../TicketsAdvanced";

function TicketResponsiveContainer() {
    const theme = useTheme();
    // useMediaQuery resolves synchronously from matchMedia on first render,
    // unlike the deprecated withWidth() HOC (which derived width from resize
    // events and could report a stale/wrong value on initial paint, causing
    // the desktop 3-column layout to render below its real minimum width).
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    if (isDesktop) {
        return <Tickets />;
    }
    return <TicketAdvanced />
}

export default TicketResponsiveContainer;
