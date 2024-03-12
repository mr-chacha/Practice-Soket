// private로 1:1 채팅이 가능하게

const { Server } = require("socket.io");

//5001번 포트 사용하고 cors로 3000번포트 허용함
const io = new Server("5001", {
  cors: {
    origin: "http://localhost:3000",
  },
});
const clients = new Map();

//
io.sockets.on("connection", (socket) => {
  console.log("user connected");
  socket.on("message", (res) => {
    const { target } = res;
    // secket.io의 특징으로 소켓의 고유 아이디값을 가져옴
    const toUser = clients.get(target);
    //target이면 private로 1:1대화 하고 그게 아니면 전체대화임
    target
      ? //io.sockets.to를 사용해서 private한 메세지를 전송하게함
        io.sockets.to(toUser).emit("sMessage", res)
      : socket.broadcast.emit("sMessage", res);
  });

  socket.on("login", (data) => {
    // secket.io의 특징으로 소켓의 고유 아이디값을 사용
    clients.set(data, socket.id);
    socket.broadcast.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
