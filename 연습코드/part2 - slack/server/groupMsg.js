// 1
const { GroupUserList, GroupRoom, GroupMsg } = require("./schema/Group");

const groupMsg = (io) => {
  // 2 사용자 아이디를 소켓에 등록함  createGroupUser()을 사용해서 해당사용자를 그룹 채팅을
  io.of("/group").use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    await createGroupUser(userId, socket.id);
    next();
  });

  // 3 처음접속시 사용자가 그룹방을 가지고있는지 확인함
  io.of("/group").on("connection", async (socket) => {
    const groupRoom = await GroupRoom.find({
      loginUserId: socket.userId,
    }).exec();
    socket.emit("group-list", groupRoom);
    // 4 'msgInit' 처음입장시 과거의 내역을 가져옴
    socket.on("msgInit", async (res) => {
      const { targetId } = res;
      let roomName = null;
      roomName = targetId.join(",");
      const groupMsg = await GroupMsg.find({
        roomNumber: roomName,
      }).exec();
      io.of("/group")
        .to(roomName)
        .emit("group-msg-init", { msg: groupMsg || [] });
    });
    // 5 참여한 모든 사용자에게 초대메시지를 전송하는 이벤트
    socket.on("reqGroupJoinRoom", async (res) => {
      const { socketId } = res;
      const groupUser = await GroupUserList.find()
        .where("userId")
        .in(socketId.split(","));
      groupUser.forEach((v) => {
        io.of("/group").to(v.socketId).emit("group-chat-req", {
          roomNumber: socketId,
          socketId: v.socketId,
          userId: socket.userId,
        });
      });
    });
    // 6 그룹메시지를 전송하고 저장함
    socket.on("groupMsg", async (res) => {
      const { msg, toUserSocketId, toUserId, fromUserId, time } = res;
      socket.broadcast.in(toUserSocketId).emit("group-msg", {
        msg: msg,
        toUserId,
        fromUserId,
        toUserSocketId: toUserSocketId,
        time: time,
      });
      await createMsgDocument(toUserSocketId, res);
    });
    // 7 'joinGroupRoom'이벤트는 사용자가 다른대화하다가 다시 그룹방에 드러왔을때 재참여하게하는 로직
    socket.on("joinGroupRoom", (res) => {
      const { roomNumber } = res;
      socket.join(roomNumber);
    });
    // 8 방에 초대받은 사용자가 방에 들어가기위함
    socket.on("resGroupJoinRoom", async (res) => {
      const { roomNumber, socketId } = res;
      socket.join(roomNumber);
      await createGroupRoom(socket.userId, roomNumber, roomNumber);

      const groupRoom = await GroupRoom.find({
        loginUserId: socket.userId,
      }).exec();
      io.of("/group").to(socketId).emit("group-list", groupRoom);
    });
  });
};

// 9 개인별로 방을 생성하는 함수
async function createGroupRoom(loginUserId, userId, socketId) {
  if (loginUserId == null) return;

  return await GroupRoom.create({
    loginUserId: loginUserId,
    status: true,
    userId: userId,
    socketId: socketId,
    type: "group",
  });
}

// 10 그룹방에 속하기 위한 아이디를 몽고디비에 저장
async function createGroupUser(userId, socketId) {
  if (userId == null) return;
  const document = await GroupUserList.findOneAndUpdate(
    { userId: userId },
    { socketId: socketId }
  );
  if (document) return document;

  return await GroupUserList.create({
    status: true,
    userId: userId,
    socketId: socketId,
  });
}

// 11 그룹메시지를 저장하는 함수
async function createMsgDocument(roomNumber, res) {
  if (roomNumber == null) return;

  return await GroupMsg.create({
    roomNumber: roomNumber,
    msg: res.msg,
    toUserId: res.toUserId,
    fromUserId: res.fromUserId,
    time: res.time,
  });
}

module.exports.groupMsginit = groupMsg;
