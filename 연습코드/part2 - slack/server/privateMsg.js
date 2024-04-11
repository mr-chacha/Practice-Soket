// 1 방생성과 채팅을 불러옴
const { PrivateRoom, PrivateMsg } = require("./schema/Private");

const privateMsg = (io) => {
  // 2 미들웨어를 접속한 유저의 아이디를 등록함
  io.of("/private").use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    next();
  });

  io.of("/private").on("connection", (socket) => {
    // 3 1:1 방에 들어가면 실행하는 'msgInit' 이벤트로 과거의 채팅이력을 가져옴
    // 클라에서 보낸 유저의 아이디와 소켓의 등록된 사용자의 아이디를 사용해서 기조에 1:1로 등록된 방이있는지 검색함
    socket.on("msgInit", async (res) => {
      const { targetId } = res;
      const userId = targetId[0];
      const privateRoom = await getRoomNumber(userId, socket.userId);
      if (!privateRoom) return;
      // 방이 있따면 find()함수를 이용해서 대화내용을 가져옴
      // 대화내용은 'private-msg-init'을 이용해서 클라이언트에 전송해줌
      const msgList = await PrivateMsg.find({
        roomNumber: privateRoom._id,
      }).exec();
      io.of("/private")
        .to(privateRoom._id)
        .emit("private-msg-init", { msg: msgList });
    });
    // 4 'privateMsg'는 1:1 메시지를 전송하는 이벤트
    // 방이 이미 있다면 'broadcast.in'을 이용해서 해당방에 있는 사용자에게 메시지를 전송
    // createMsgDocument()를 사용해서 몽고디비에 메시지를 저장함
    socket.on("privateMsg", async (res) => {
      const { msg, toUserId, time } = res;
      const privateRoom = await getRoomNumber(toUserId, socket.userId);
      if (!privateRoom) return;
      socket.broadcast.in(privateRoom._id).emit("private-msg", {
        msg: msg,
        toUserId: toUserId,
        fromUserId: socket.userId,
        time: time,
      });
      await createMsgDocument(privateRoom._id, res);
    });
    // 5 'reqJoinRoom'이벤트는 1:1 대화방에 자신을 포함시키는 것은물론 상대방에게 방에 들어오라는 메시지를 전송함
    socket.on("reqJoinRoom", async (res) => {
      const { targetId, targetSocketId } = res;
      let privateRoom = await getRoomNumber(targetId, socket.userId);
      if (!privateRoom) {
        privateRoom = `${targetId}-${socket.userId}`;
        await findOrCreateRoomDocument(privateRoom);
      } else {
        privateRoom = privateRoom._id;
      }
      socket.join(privateRoom);
      io.of("/private")
        .to(targetSocketId)
        .emit("msg-alert", { roomNumber: privateRoom });
    });
    // 6 초대를 받은거면 'resJoinRoom'이벤트가 자동으로 호춤되고 동의없이 방에 들어가게됨
    socket.on("resJoinRoom", (res) => {
      socket.join(res);
    });
  });
};

// 7 getRoomNumber()는 몽고디비에 등록된 방을 검색하는 역할을함
async function getRoomNumber(fromId, toId) {
  return (
    (await PrivateRoom.findById(`${fromId}-${toId}`)) ||
    (await PrivateRoom.findById(`${toId}-${fromId}`))
  );
}

// 8 방을 생성하는 역할을 함
async function findOrCreateRoomDocument(room) {
  if (room == null) return;

  const document = await PrivateRoom.findById(room);
  if (document) return document;
  return await PrivateRoom.create({
    _id: room,
  });
}

// 9 메세지를 생성함
async function createMsgDocument(roomNumber, res) {
  if (roomNumber == null) return;

  return await PrivateMsg.create({
    roomNumber: roomNumber,
    msg: res.msg,
    toUserId: res.toUserId,
    fromUserId: res.fromUserId,
    time: res.time,
  });
}

module.exports.privateMsginit = privateMsg;
