import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "./seatContainer.module.css";
import classNames from "classnames/bind";
import { socket } from "../../socket";

const cx = classNames.bind(styles);

const SeatContainer = () => {
  // 1
  const { id, title } = useParams();
  const [booked, setBooked] = useState("");
  const [seats, setSeats] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  // 2 좌석페이지에 진입할때 소켓의 join을 호출 하고 지금 어느상영관인지 구분하기 위해 params로 가져온 id를 넣음
  useEffect(() => {
    socket.emit("join", id);
    return () => {
      socket.disconnect();
    };
  }, []);

  // 3 페이지에 진입시 서버에 저장된 좌석 배치를 가져옴
  useEffect(() => {
    function setSeat(data) {
      setSeats(data);
    }
    socket.on("sSeatMessage", setSeat);
    return () => {
      socket.off("sSeatMessage", setSeat);
    };
  }, []);

  // 4 회색클릭시 파란색으로 빨간색이나 통로는 클릭못하게 리턴
  const onClickHandler = (e) => {
    if (isDisabled) return;
    const { id, status } = e.target.dataset;
    if (status === "3" || status === "0") return;
    setBooked(id);
    const tempSeats = seats.map((s) => {
      return s.map((i) => {
        let temp = { ...i };
        if (i.seatNumber === id) {
          temp = { ...i, status: 2 };
        } else {
          temp = { ...i, status: i.status === 2 ? 1 : i.status };
        }
        return temp;
      });
    });
    setSeats(tempSeats);
  };

  // 5 컨펌 버튼클릭하면 실행됨 선택된 좌석을 소켓 서버로 전송하고 서버는 좌석을 빨강으로 변경하고 다시 클라한테 알려줌
  const onConfirmHandler = () => {
    if (!booked) return;
    socket.emit("addSeat", booked);
    setIsDisabled(true);
  };
  return (
    <div className={cx("seat_container")}>
      <h2 className={cx("title")}>{title}</h2>
      <div className={cx("screen")}>screen</div>
      <ul className={cx("wrap_seats")}>
        {seats.map((v) => {
          return v.map((i, idx) => (
            <li
              key={`seat_${idx}`}
              data-id={i.seatNumber}
              data-status={i.status}
              className={cx(
                "seat",
                i.status === 0 && "empty",
                i.status === 1 && "default",
                i.status === 2 && "active",
                i.status === 3 && "soldout"
              )}
              onClick={onClickHandler}
            ></li>
          ));
        })}
      </ul>
      <div className={cx("r_wrap")}>
        <h4 className={cx("r_title")}>{booked}</h4>
        {!isDisabled && (
          <button className={cx("r_confirm")} onClick={onConfirmHandler}>
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};
export default SeatContainer;
