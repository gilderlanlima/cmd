import { ArrowForwardIos, ContentCopy, Delete } from "@mui/icons-material";
import BallotIcon from "@mui/icons-material/Ballot";
import { Typography } from "@mui/material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import {
  flowNodePalettes,
  getHandleArrowStyle,
  getHandleStyle,
  getNodeActionIconStyle,
  getNodeActionsStyle,
  getNodeBodyStyle,
  getNodeHeaderStyle,
  getNodeIconWrapStyle,
  getNodePreviewCenterStyle,
  getNodePreviewStyle,
  getNodePreviewTextStyle,
  getNodeShellStyle,
  getNodeTitleGroupStyle,
  getNodeTitleStyle,
} from "./flowNodeStyles";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const palette = flowNodePalettes.menu;

  return (
    <div style={getNodeShellStyle(palette)}>
      <Handle
        type="target"
        position="left"
        style={getHandleStyle(palette.handle, "target")}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={getHandleArrowStyle()} />
      </Handle>

      <div style={getNodeHeaderStyle()}>
        <div style={getNodeTitleGroupStyle()}>
          <div style={getNodeIconWrapStyle(palette)}>
            <BallotIcon style={{ width: 13, height: 13 }} />
          </div>
          <div style={getNodeTitleStyle()}>Trocar Fluxo</div>
        </div>

        <div style={getNodeActionsStyle()}>
          <ContentCopy
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("duplicate");
            }}
            sx={getNodeActionIconStyle(palette)}
          />

          <Delete
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("delete");
            }}
            sx={getNodeActionIconStyle(palette)}
          />
        </div>
      </div>

      <div style={getNodeBodyStyle()}>
        <div style={getNodePreviewStyle(palette)}>
          <div style={getNodePreviewCenterStyle()}>
            <BallotIcon style={{ color: palette.accent }} />
          </div>
          <Typography textAlign="center" sx={getNodePreviewTextStyle(2)}>
            {data?.typebotIntegration?.message || "Fluxo de destino"}
          </Typography>
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
