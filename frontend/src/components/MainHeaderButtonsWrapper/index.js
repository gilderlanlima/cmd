import React from "react";
import { styled } from "goober";

const ButtonsBar = styled("div")`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 12px;
	margin-left: auto;
	flex-wrap: wrap;
	padding-left: 12px;
`;

const MainHeaderButtonsWrapper = ({ children }) => {
	return <ButtonsBar>{children}</ButtonsBar>;
};

export default MainHeaderButtonsWrapper;
