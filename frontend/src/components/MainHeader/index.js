import React from "react";
import { styled } from "goober";
import { useTheme } from "@material-ui/core/styles";

const HeaderShell = styled("div")`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 0 8px 12px;
	margin-bottom: 2px;
	border-bottom: 1px solid
		${props =>
			props.$isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
	flex-wrap: wrap;
`;

const MainHeader = ({ children }) => {
	const theme = useTheme();

	return <HeaderShell $isLight={theme.mode === "light"}>{children}</HeaderShell>;
};

export default MainHeader;
