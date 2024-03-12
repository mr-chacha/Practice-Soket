import { io } from "socket.io-client";

// goods 네임스페이스로 접속된 소켓의 객체
export const socketGoods = io("http://localhost:5001/goods", {
  //autoConnect 를 false로 두면 컴포넌트가 마운트 될때 자동으로 소켓 연결되는걸 막아줌
  // 수동으로 연결하려면 socket.connect()을 사용해야함

  autoConnect: false,
});

// user 네임스페이스로 접속된 소켓의 객체
export const socketUser = io("http://localhost:5001/user", {
  //autoConnect 를 false로 두면 컴포넌트가 마운트 될때 자동으로 소켓 연결되는걸 막아줌
  // 수동으로 연결하려면 socket.connect()을 사용해야함
  autoConnect: false,
});
