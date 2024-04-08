// 1 몽고디비 라이브러리랑 Schema를 불러옴
const mongoose = require("mongoose");
const Document = require("./Schema");

const uri = "MongoDB URL";

//strictQuery를 false로 둬야 몽고디비에 접속이 편하지만 실제 배포할거면 true로 해야함
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// 2 소켓 서버를 생성 userMap에 접속한 사용자의 값을 저장
const io = require("socket.io")(5001, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const userMap = new Map();

io.on("connection", (socket) => {
  let _documentId = "";
  // 3 접속시 join 이벤트 발동
  socket.on("join", async (documentId) => {
    _documentId = documentId;
    // findOrCreateDocument는 클라이언트에서 전달받은 도큐먼트 아이디를 이용함
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    // 접속한 사용자에게 현재 문서의 내용과 접속된 사용자 정보를 전송함
    socket.emit("initDocument", {
      _document: document.data,
      userList: userMap.get(documentId) || [],
    });
    const myId = Array.from(socket.rooms)[0];
    setUserMap(_documentId, myId);
    socket.broadcast.to(_documentId).emit("newUser", myId);
  });

  // 4 현재 작성중인 글을 저장
  socket.on("save-document", async (data) => {
    await Document.findByIdAndUpdate(_documentId, { data });
  });

  // 5작성되는 글을 실시간으로 전송받아서 다른사용자에게 전송함
  socket.on("send-changes", (delta) => {
    socket.broadcast.to(_documentId).emit("receive-changes", delta);
  });

  // 6 다른 사용자의 커서를 실시간으로 감지함
  socket.on("cursor-changes", (range) => {
    const myRooms = Array.from(socket.rooms);
    socket.broadcast
      .to(_documentId)
      .emit("receive-cursor", { range: range, id: myRooms[0] });
  });

  socket.on("disconnect", () => {
    console.log("disconnect...");
  });
});

// 7
function setUserMap(documentId, myId) {
  const tempUserList = userMap.get(documentId);
  if (!tempUserList) {
    userMap.set(documentId, [myId]);
  } else {
    userMap.set(documentId, [...tempUserList, myId]);
  }
}

// 8 몽고디비에 접근해서 문서의 유무를 확인함 문서가 없으면 create
async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: "" });
}
