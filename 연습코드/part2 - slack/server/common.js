// 1 유저테이블의 스키마 내용을 가져옴
const User = require("./schema/User");

const common = (io) => {
  // 2 미들웨어를 이용해서 소켓의 초기설정
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    await findOrCreateUser(socket.userId, socket.id);
    next();
  });

  // 3 소켓연결이되면 몽고디비에 등록된 사용자 리스트를 클라이언트로 전송
  //findOneAndUpdate() 를 이용해서 몽고디비에 사용자를 등록함
  io.on("connection", async (socket) => {
    io.sockets.emit("user-list", await User.find());

    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ _id: socket.userId }, { status: false });
      io.sockets.emit("user-list", await User.find());
      console.log("disconnect...");
    });
  });
};

// 4 findOneAndUpdate() 는 사용자를 등록하는 함수임 유저 테이블에 정보가 있으면 true를 반환
async function findOrCreateUser(userId, socketId) {
  if (userId == null) return;

  const document = await User.findOneAndUpdate(
    { _id: userId },
    { status: true }
  );
  if (document) return document;
  return await User.create({
    _id: userId,
    status: true,
    userId: userId,
    socketId: socketId,
  });
}

module.exports.commoninit = common;
