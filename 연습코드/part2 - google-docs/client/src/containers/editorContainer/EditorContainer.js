import React, { useEffect, useRef, useState } from "react";
// 1
import { useParams } from "react-router-dom";
import { debounce } from "lodash-es";
import TextEditor from "../../components/textEditor/TextEditor";
import { socket } from "../../socket";

// 2  cursorMap으로 실시간 커서의 위치를 반영함
const cursorMap = new Map();
const cursorColor = [
  "#FF0000",
  "#FF5E00",
  "#FFBB00",
  "#FFE400",
  "#ABF200",
  "#1DDB16",
  "#00D8FF",
  "#0054FF",
];

const EditorContainer = () => {
  const timerRef = useRef(null);
  const cursorRef = useRef(null);
  const reactQuillRef = useRef(null);
  // 3
  const { id: documentId } = useParams();

  const [text, setText] = useState("");

  // 4 처음 사용자가 접속하면 join 이벤트를 호출함
  useEffect(() => {
    socket.emit("join", documentId);
    return () => {
      socket.disconnect();
    };
  }, []);

  // 5 once는 소켓 연결이후 한번만 실행되는 접속중인 사용자의 정보를 가져오게함
  useEffect(() => {
    socket.once("initDocument", (res) => {
      const { _document, userList } = res;
      setText(_document);
      userList.forEach((u) => {
        setCursor(u);
      });
    });
  }, []);

  // 6 새로운 유저가 들어올때
  useEffect(() => {
    function setCursorHandler(user) {
      setCursor(user);
    }
    socket.on("newUser", setCursorHandler);
    return () => {
      socket.off("newUser", setCursorHandler);
    };
  }, []);

  // 7
  useEffect(() => {
    if (!reactQuillRef.current) return;
    cursorRef.current = reactQuillRef.current.getEditor().getModule("cursors");
  }, []);

  // 8
  useEffect(() => {
    function updateContentHandler(delta) {
      reactQuillRef.current.getEditor().updateContents(delta);
    }
    socket.on("receive-changes", updateContentHandler);
    return () => {
      socket.off("receive-changes", updateContentHandler);
    };
  }, []);

  // 9
  useEffect(() => {
    function updateHandler(res) {
      const { range, id } = res;
      debouncedUpdate(range, id);
    }
    socket.on("receive-cursor", updateHandler);
    return () => {
      socket.off("receive-cursor", updateHandler);
    };
  }, []);

  // 10 문서작성시 호출되는 함수
  const onChangeTextHandler = (content, delta, source, editor) => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      socket.emit(
        "save-document",
        reactQuillRef.current.getEditor().getContents()
      );
      timerRef.current = null;
    }, 1000);
    if (source !== "user") return;
    socket.emit("send-changes", delta);
  };

  // 11
  function setCursor(id) {
    if (!cursorMap.get(id)) {
      cursorRef.current.createCursor(
        id,
        id,
        cursorColor[Math.floor(Math.random() * 8)]
      );
      cursorMap.set(id, cursorRef.current);
    }
  }

  // 12
  const debouncedUpdate = debounce((range, id) => {
    cursorMap.get(id).moveCursor(id, range);
  }, 500);

  // 13
  const onChangeSelection = (selection, source, editor) => {
    if (source !== "user") return;
    socket.emit("cursor-changes", selection);
  };

  return (
    <TextEditor
      text={text}
      onChangeTextHandler={onChangeTextHandler}
      onChangeSelection={onChangeSelection}
      reactQuillRef={reactQuillRef}
    />
  );
};

export default EditorContainer;
