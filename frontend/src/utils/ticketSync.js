export const emitTicketSync = (payload) => {
  if (typeof window === "undefined" || !payload) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("ticket:sync", {
      detail: payload,
    })
  );
};

