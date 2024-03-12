//server.js HTML 웹소켓 채팅
const WebSocket = require("ws");

//5001번 포트를 열고
const wss = new WebSocket.Server({ port: 5001 });

//웹소켓에 연결이 되었을때 실행함
wss.on("connection", (ws) => {
  // 서버에 연결된 모든 클라이언트를 반복하여 각 클라이언트에게 메세지를 전송하게함
  const broadCastHandler = (msg) => {
    wss.clients.forEach(function each(client, i) {
      //내가 보낸 메세지를 내가 받지않게 하기위한 예외처리
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  //클라이언트로부터 메세지를 전송받게되면 실행함
  ws.on("message", (res) => {
    const { type, data, id } = JSON.parse(res);
    switch (type) {
      //새로운유저
      case "id":
        broadCastHandler(JSON.stringify({ type: "welcome", data: data }));
        break;
      //메세지
      case "msg":
        broadCastHandler(JSON.stringify({ type: "other", data: data, id: id }));
        break;
      default:
        break;
    }
  });

  //클라이언트가 연결을 종료하면 실행
  ws.on("close", () => {
    console.log("client has disconnected");
  });
});
