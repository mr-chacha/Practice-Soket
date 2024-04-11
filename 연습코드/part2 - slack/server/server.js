// privateMsg = 1:1 채팅
// groupMsg = 그룹채팅
const privateMsg = require("./privateMsg");
const groupMsg = require("./groupMsg");
const common = require("./common");
const mongoose = require("mongoose");
require("dotenv").config();

// 2 몽고디비 연결
const uri = process.env.NEXT_PUBLIC_MONGODB_URL;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// 3 소켓서버 설정
const io = require("socket.io")(5001, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// 4. 불러온 로직을 실행하는 메소드
common.commoninit(io);
groupMsg.groupMsginit(io);
privateMsg.privateMsginit(io);
