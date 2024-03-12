// broadCast 적용한 socket.io

const { Server } = require("socket.io");

//5001번 포트 사용하고 cors로 3000번포트 허용함
const io = new Server("5001", {
  cors: {
    origin: "http://localhost:3000",
  },
});

//
io.sockets.on("connection", (socket) => {
  socket.on("message", (data) => {
    // io.sockets.emit("sMessage", data);
    //아래코드가 소켓 io에서 broadcast를 사용할때의 코드
    socket.broadcast.emit("sMessage", data);
  });

  socket.on("login", (data) => {
    // io.sockets.emit("sLogin", data);
    //아래코드가 소켓 io에서 broadcast를 사용할때의 코드
    socket.broadcast.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
