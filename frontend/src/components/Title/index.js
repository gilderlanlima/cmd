import React from "react";
import Typography from "@material-ui/core/Typography";
import { styled } from "goober";

const TitleText = styled(Typography)`
	font-size: clamp(1.45rem, 1.1rem + 0.8vw, 1.95rem) !important;
	font-weight: 700 !important;
	letter-spacing: -0.03em !important;
	line-height: 1.05 !important;
	margin: 0 !important;
`;

export default function Title(props) {
	return (
		<TitleText variant="h5" color="primary" gutterBottom>
			{props.children}
		</TitleText>
	);
}
