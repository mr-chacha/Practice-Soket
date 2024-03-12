import React, { useEffect, useState } from "react";
import { socketGoods } from "./socket";
// socket.js에서 정의한 socketGoods 객체를 가져옴

const GoodsPage = () => {
  // 소켓 연결의 여부
  const [isConnect, setIsConnect] = useState(false);
  // 소켓 연결의 이벤트 리스터
  useEffect(() => {
    function onConnect() {
      setIsConnect(true);
    }
    function onDisConnect() {
      setIsConnect(false);
    }
    socketGoods.on("connect", onConnect);
    socketGoods.on("disconnect", onDisConnect);

    return () => {
      socketGoods.off("connect", onConnect);
      socketGoods.off("disconnect", onDisConnect);
    };
  }, []);
  // 화면에 Connected 버튼을 클릭하면 실행하게함
  const onConnectHandler = () => {
    // socketGoods.connect()은 소켓을 연결할때 사용하는 메소드
    socketGoods.connect();
  };

  // 화면에 Disconnectedfmf 클릭하면 실행
  const onDisConnectHandler = () => {
    // socketGoods.disconnect()는 소켓을 연결을 해제할때 사용하는 메소드
    socketGoods.disconnect();
  };
  return (
    <div className="text-wrap">
      <h1>
        GoodsNameSpace is
        {isConnect ? (
          <em className="active"> Connected!</em>
        ) : (
          <em className="deactive"> Not Connected!</em>
        )}
      </h1>
      <div className="btn-box">
        <button onClick={onConnectHandler} className="active-btn">
          Connected
        </button>
        <button onClick={onDisConnectHandler} className="deactive-btn">
          Disconnected
        </button>
      </div>
    </div>
  );
};

export default GoodsPage;
