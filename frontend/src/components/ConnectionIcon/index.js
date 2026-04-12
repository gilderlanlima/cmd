import React from "react";

import { getChannelMeta } from "../../utils/channelCatalog";

const ConnectionIcon = ({
  connectionType,
  size = 16,
  fontSize = "small",
  className,
  style,
}) => {
  const channelMeta = getChannelMeta(connectionType);

  return channelMeta.render({
    size,
    fontSize,
    className,
    style,
  });
};

export default ConnectionIcon;
