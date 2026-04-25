import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  DynamicFeed,
} from "@mui/icons-material";
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
  getNodeOptionRowStyle,
  getNodeOptionTextStyle,
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
    <div style={getNodeShellStyle(palette, { maxWidth: 214 })}>
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
            <DynamicFeed style={{ width: 13, height: 13 }} />
          </div>
          <div style={getNodeTitleStyle()}>Menu</div>
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
        <div style={getNodePreviewStyle(palette, { minHeight: 62 })}>
          <div style={{ ...getNodePreviewTextStyle(3), textAlign: "left" }}>
            {data.message}
          </div>
        </div>

        {data.arrayOption.map((option) => (
          <div key={option.number} style={getNodeOptionRowStyle()}>
            <div style={getNodeOptionTextStyle()}>
              {`[${option.number}] ${option.value}`}
            </div>

            <Handle
              type="source"
              position="right"
              id={`a${option.number}`}
              style={{
                ...getHandleStyle(palette.handle, "source"),
                top: "50%",
                right: -11,
                transform: "translateY(-50%)",
              }}
              isConnectable={isConnectable}
            >
              <ArrowForwardIos sx={getHandleArrowStyle()} />
            </Handle>
          </div>
        ))}
      </div>
    </div>
  );
});
