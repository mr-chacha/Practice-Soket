import { io } from "socket.io-client";

export const socket = io("http://localhost:5001", {
  //자동연결 방지
  autoConnect: false,
});
