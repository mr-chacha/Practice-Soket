import { io } from "socket.io-client";

export const socket = io("http://localhost:5001", {
  autoConnect: false,
});
// 1
export const socketPrivate = io("http://localhost:5001/private", {
  autoConnect: false,
});
// 2
export const socketGroup = io("http://localhost:5001/group", {
  autoConnect: false,
});
