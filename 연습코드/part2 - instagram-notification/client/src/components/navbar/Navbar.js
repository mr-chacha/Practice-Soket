import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { HiOutlinePaperAirplane } from "react-icons/hi";
// 소켓을 불러옴
import { socket } from "../../socket";
import styles from "./Navbar.module.css";

const Navbar = () => {
  // 좋아요의 개수를 저장
  const [notifications, setNotifications] = useState([]);

  // 소켓 통신인 getNotification 을 사용해서 좋아요를 받을때 서버에서 전송한 데이터를 받는 콜백함수
  useEffect(() => {
    function getNofi(data) {
      console.log("data", data);
      const { type } = data;
      const temp =
        type === "0" ? [...notifications, data] : notifications.pop();
      setNotifications(temp || []);
    }
    socket.on("getNotification", getNofi);

    console.log("getNofi", getNofi);
    return () => {
      socket.off("getNotification", getNofi);
    };
  }, []);

  return (
    <div className={styles.navbar}>
      <span className={styles.logo}>Instagram</span>
      <div className={styles.icons}>
        <div className={styles.heartContainer}>
          {notifications.length > 0 && <span className={styles.noti}></span>}
          <AiOutlineHeart size="20" className={styles.heart} />
          {notifications.length > 0 && (
            <div className={styles.likeBubble}>
              <AiFillHeart size="15" color="#fff" />{" "}
              <div className={styles.count}>{notifications.length}</div>
            </div>
          )}
        </div>

        <HiOutlinePaperAirplane className={styles.airplane} size="20" />
      </div>
    </div>
  );
};

export default Navbar;
