const { Server } = require("socket.io");

const io = new Server("5001", {
  cors: {
    origin: "http://localhost:3000",
  },
});

//네임스페이스를 설정하려면 of() 메소드만 사용하면됨
io.of("/goods").on("connection", (socket) => {
  console.log("goods connected");
  socket.on("shoes", (res) => {});
  socket.on("pants", (res) => {});
});
io.of("/user").on("connection", (socket) => {
  console.log("user connected");
  socket.on("admin", (res) => {});
});
