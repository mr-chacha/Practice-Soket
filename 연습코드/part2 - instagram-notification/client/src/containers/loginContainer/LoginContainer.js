import { useEffect, useState, useContext } from "react";
import styles from "./LoginContainer.module.css";
// Context를 불러와서 로그인할때 사용자의 이름을 저장
import { socket } from "../../socket";
import { Context } from "../../context";
import { AUTH_INFO } from "../../context/action";
import logo from "../../images/logo.png";
import { useNavigate } from "react-router-dom";
const LoginContainer = () => {
  // 2
  const navigate = useNavigate();
  // dispatch로 함수를 전역에서 관리함
  const { dispatch } = useContext(Context);
  const [user, setUser] = useState("");

  // 소켓서버에서 사용자 이름 유효성 검사를 확인하고 오류가안나면 콜백함
  useEffect(() => {
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        console.log("err");
      }
    });
  }, []);

  const setUserNameHandler = (e) => {
    setUser(e.target.value);
  };
  // 로그인 버튼 클릭시 payload에 실제 업데이트할값을 추가
  // 서버 사이드의 handshake.auth를 추가하는 부분
  const onLoginHandler = (e) => {
    e.preventDefault();
    dispatch({
      type: AUTH_INFO,
      payload: user,
    });
    socket.auth = { userName: user };
    socket.connect();
    navigate("/post");
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login}>
        <img src={logo} width="200px" alt="logo" />
        <form className={styles.loginForm} onSubmit={onLoginHandler}>
          <input
            className={styles.input}
            type="text"
            value={user}
            placeholder="Enter your name"
            onChange={setUserNameHandler}
          />
          <button onClick={onLoginHandler} className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginContainer;
