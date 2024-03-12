import { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { BiMessageRounded } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
// 소켓통신을 위해 소켓을 가져옴
import { socket } from "../../socket";
import styles from "./Card.module.css";

// 리스트를 구분하는 key값이랑 포스팅겍체, 로그인한 사용자의 이름을 인자로 받음
const Card = ({ key, post, loginUser }) => {
  // 좋아요 여부를 판단
  const [liked, setLiked] = useState(false);

  // 좋아요 누르면 호출됨, 좋아요 클릭시 sendNotification소켓이벤트를 실행해서
  // 좋아요 누른사람과 좋아요를 받은사람에게 정보를 전달함
  const onLikeHandler = (e) => {
    const { type } = e.target.closest("svg").dataset;
    setLiked(type === "0");
    socket.emit("sendNotification", {
      senderName: loginUser,
      receiverName: post.userName,
      type,
    });
  };

  return (
    <div className={styles.card} key={key}>
      <div className={styles.info}>
        <div className={styles.userInfo}>
          <img src={post.userImg} alt="" className={styles.userImg} />
          <div className={styles.username}>
            <div>{post.userName}</div>
            <div className={styles.loc}>{post.location}</div>
          </div>
        </div>
        <FiMoreVertical size="20" />
      </div>
      <img src={post.postImg} alt="" className={styles.postImg} />
      <div className={styles.icons}>
        {
          // 좋아요 상태에 따라 다른 하트를 노출
          liked ? (
            <AiFillHeart
              className={styles.fillHeart}
              size="20"
              onClick={onLikeHandler}
              data-type="1"
            />
          ) : (
            <AiOutlineHeart
              className={styles.heart}
              size="20"
              onClick={onLikeHandler}
              data-type="0"
            />
          )
        }
        <BiMessageRounded className={styles.msg} size="20" />
        <HiOutlinePaperAirplane className={styles.airplane} size="20" />
      </div>
    </div>
  );
};

export default Card;
