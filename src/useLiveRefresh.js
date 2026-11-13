import { useEffect, useRef } from "react";
import socket from "./socket";

// Re-runs `reload` whenever the server reports a change to one of
// `resources` (MongoDB collection names, e.g. "tasks", "orders" — see
// backend/utils/liveUpdates.js). Also reloads when the tab becomes visible
// again or the socket reconnects, since events sent while the tab was
// asleep or offline are missed.
export default function useLiveRefresh(resources, reload, enabled = true) {
  const reloadRef = useRef(reload);

  useEffect(() => {
    reloadRef.current = reload;
  });

  const key = resources.join(",");

  useEffect(() => {
    if (!enabled) return;

    const watched = key.split(",");
    let timer;
    // Collapse a burst of events into one reload.
    const trigger = () => {
      clearTimeout(timer);
      timer = setTimeout(() => reloadRef.current(), 300);
    };

    const onDataChanged = (data) => {
      if (watched.includes(data?.resource)) trigger();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") trigger();
    };

    socket.on("dataChanged", onDataChanged);
    socket.io.on("reconnect", trigger);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      socket.off("dataChanged", onDataChanged);
      socket.io.off("reconnect", trigger);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [key, enabled]);
}
