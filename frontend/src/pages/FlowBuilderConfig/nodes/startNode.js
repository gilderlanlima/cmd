import { ArrowForwardIos, PlayCircleRounded } from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import {
  flowNodePalettes,
  getHandleArrowStyle,
  getHandleStyle,
  getNodeBodyStyle,
  getNodeHeaderStyle,
  getNodeIconWrapStyle,
  getNodePreviewStyle,
  getNodePreviewTextStyle,
  getNodeShellStyle,
  getNodeTitleGroupStyle,
  getNodeTitleStyle,
} from "./flowNodeStyles";

export default memo(({ isConnectable }) => {
  const palette = flowNodePalettes.start;

  return (
    <div style={getNodeShellStyle(palette, { minWidth: 170, maxWidth: 186, padding: "10px 12px" })}>
      <div style={getNodeHeaderStyle()}>
        <div style={getNodeTitleGroupStyle()}>
          <div style={getNodeIconWrapStyle(palette)}>
            <PlayCircleRounded style={{ width: 13, height: 13 }} />
          </div>
          <div style={getNodeTitleStyle()}>Início</div>
        </div>
      </div>

      <div style={getNodeBodyStyle()}>
        <div style={getNodePreviewStyle(palette, { minHeight: 42, padding: "8px 10px" })}>
          <div style={{ ...getNodePreviewTextStyle(2), textAlign: "left" }}>
            Mensagem inicial do fluxo
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position="right"
        id="a"
        style={getHandleStyle(palette.handle, "source")}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={getHandleArrowStyle()} />
      </Handle>
    </div>
  );
});
