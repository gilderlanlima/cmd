import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from "./serviceWorker";

import App from "./App";
import BootErrorBoundary from "./components/BootErrorBoundary";

ReactDOM.render(
  <>
    <CssBaseline />
    <BootErrorBoundary>
      <App />
    </BootErrorBoundary>
  </>,
  document.getElementById("root"),
  () => {
    if (typeof window.finishProgress === "function") {
      window.finishProgress();
    }
  }
);

// Avoid stale cached bundles that can cause white screen after deployments.
serviceworker.unregister();
