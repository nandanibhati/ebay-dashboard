import { io } from "socket.io-client";

const socket = io(
  "https://ebay-dashboard-z7h2.onrender.com",
  {
    transports: ["websocket"],
    autoConnect: true,
  }
);

export default socket;