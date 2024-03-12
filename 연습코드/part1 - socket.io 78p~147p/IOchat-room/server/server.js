// private로 1:1 채팅이 가능하게

const { Server } = require("socket.io");

//5001번 포트 사용하고 cors로 3000번포트 허용함
const io = new Server("5001", {
  cors: {
    origin: "http://localhost:3000",
  },
});
const clients = new Map();

io.sockets.on("connection", (socket) => {
  console.log("user connected");
  socket.on("message", (res) => {
    const { target } = res;
    if (target) {
      const toUser = clients.get(target);
      io.sockets.to(toUser).emit("sMessage", res);
      return;
    }
    //록인 버튼을 누르고 전송된 방번호를 이용해서 번호를 넘겨줌
    // join()메소드는 접속한 사용자를 특정한 방에 배정 할 수 있는 함수임
    // rooms은 해당 접속자가 어떤 방에 속해있는지 알수있게해줌
    const myRooms = Array.from(socket.rooms);
    console.log("myRooms", myRooms);
    if (myRooms.length > 1) {
      socket.broadcast.in(myRooms[1]).emit("sMessage", res);
      return;
    }
    socket.broadcast.emit("sMessage", res);

    // 여러개의 방에 들어가려면  in() 메소드를 사용
    // socket.broadcast.in('1').in('2').emit('sMessage',res)

    // 특정방에 소속되고싶지 않으먄 except() 메소드를 사용
    //  socket.broadcast.in('1').in('2').except('3').emit('sMessage',res)
  });

  //아래 코드가 있어야 상대방이 로그인할때 채팅방에 입장하였다라는걸 띄울수있음
  socket.on("login", (data) => {
    const { userId, roomNumber } = data;

    socket.join(roomNumber);
    clients.set(userId, socket.id);
    socket.broadcast.emit("sLogin", userId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
