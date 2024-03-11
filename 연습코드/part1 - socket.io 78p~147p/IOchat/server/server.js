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
    io.sockets.emit("sMessage", data);
  });

  socket.on("login", (data) => {
    io.sockets.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
