import {
  AccessTime,
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Image,
  LibraryBooks,
  Message,
  MicNone,
  Videocam,
} from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import { Typography } from "@mui/material";
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

const resolveItemMeta = (item, elements) => {
  const current = elements.filter((itemLoc) => itemLoc.number === item)[0];

  if (!current) {
    return {
      icon: <LibraryBooks style={{ color: flowNodePalettes.content.accent }} />,
      text: "Bloco sem conteúdo",
    };
  }

  if (item.includes("message")) {
    return {
      icon: <Message style={{ color: flowNodePalettes.content.accent }} />,
      text: current.value,
    };
  }

  if (item.includes("interval")) {
    return {
      icon: <AccessTime style={{ color: flowNodePalettes.content.accent }} />,
      text: `${current.value} segundos`,
    };
  }

  if (item.includes("img")) {
    return {
      icon: <Image style={{ color: flowNodePalettes.content.accent }} />,
      text: current.original,
    };
  }

  if (item.includes("audio")) {
    return {
      icon: <MicNone style={{ color: flowNodePalettes.content.accent }} />,
      text: current.original,
    };
  }

  if (item.includes("video")) {
    return {
      icon: <Videocam style={{ color: flowNodePalettes.content.accent }} />,
      text: current.original,
    };
  }

  return {
    icon: <LibraryBooks style={{ color: flowNodePalettes.content.accent }} />,
    text: current.original,
  };
};

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const palette = flowNodePalettes.content;

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
            <LibraryBooks style={{ width: 13, height: 13 }} />
          </div>
          <div style={getNodeTitleStyle()}>Conteúdo</div>
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
        {data.seq.map((item) => {
          const meta = resolveItemMeta(item, data.elements);

          return (
            <div key={item} style={getNodePreviewStyle(palette)}>
              <div style={getNodePreviewCenterStyle()}>{meta.icon}</div>
              <Typography textAlign="center" sx={getNodePreviewTextStyle(2)}>
                {meta.text}
              </Typography>
            </div>
          );
        })}
      </div>

      <Handle
        type="source"
        position="right"
        id="a"
        style={{ ...getHandleStyle(palette.handle, "source"), top: "88%" }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={getHandleArrowStyle()} />
      </Handle>
    </div>
  );
});
