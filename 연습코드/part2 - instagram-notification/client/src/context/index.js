import { createContext, useReducer } from "react";
import { AUTH_INFO } from "./action";

// reducer가 관리할 초기 객체변수
const initialState = {
  userName: "",
};

//createContext를 사용해서 전역으로 관리할 Context를만듬
const Context = createContext({});

// switch문을 사용해서 들어온 사태의 키워값을 구분하여 실행
// payload는 상태를 업데이트 하는 최신 변수를 받음

const reducer = (state = initialState, action) => {
  console.log("act", action);
  switch (action.type) {
    case AUTH_INFO:
      return {
        ...state,
        userName: action.payload,
      };
    default:
      return state;
  }
};

// 모든 Context API를 사용하는 모든 컴포넌트에게 변화를 알림
const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("state", state);
  console.log("dispatch", dispatch);
  const value = { state, dispatch };
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, StoreProvider };
