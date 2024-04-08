const { Server } = require("socket.io");
const { seats } = require("./data");

// 1. 소켓서버를 생성
const io = new Server("5001", {
  cors: {
    origin: "http://localhost:3000",
  },
});

// 2 data.js에서 좌석 배치 데이터를 가져옴
// 3개의 영화가 있음
let avatar = [...seats];
let antman = [...seats];
let cats = [...seats];

// 3최종 확정된 좌석의 상태를 변환
const setSeats = (roomNumber, seat) => {
  let temp = [];
  function setStatus(seats) {
    return seats.map((i) => {
      let temp = { ...i };
      if (i.seatNumber === seat) {
        temp = { ...i, status: 3 };
      }
      return temp;
    });
  }
  if (roomNumber === "1") {
    temp = [...avatar].map((s) => setStatus(s));
    avatar = [...temp];
  } else if (roomNumber === "2") {
    temp = [...antman].map((s) => setStatus(s));
    antman = [...temp];
  } else {
    temp = [...cats].map((s) => setStatus(s));
    cats = [...temp];
  }
  return temp;
};
io.on("connection", (socket) => {
  // 4 소켓의 'join'이라는 이벤트를 사용해서 room을 배정함
  socket.on("join", (movie) => {
    socket.join(movie);
    let tempSeat = [];
    if (movie === "1") {
      tempSeat = avatar;
    } else if (movie === "2") {
      tempSeat = antman;
    } else {
      tempSeat = cats;
    }
    io.sockets.in(movie).emit("sSeatMessage", tempSeat);
  });

  // 5 클라이언트 측에서 comfrim을 클릭하면 호출 되는 이벤트로 현재 접속한 소켓의 room을찾아서 room에 접속한 유저에게 좌석 배치도를 전송해줌
  socket.on("addSeat", (seat) => {
    const myRooms = Array.from(socket.rooms);
    io.sockets.in(myRooms[1]).emit("sSeatMessage", setSeats(myRooms[1], seat));
  });

  socket.on("disconnect", () => {
    console.log("logout");
  });
});
