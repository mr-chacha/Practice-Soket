import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginContainer, PostingContainer } from "./containers";
import { StoreProvider } from "./context";

const App = () => {
  return (
    //StoreProvider 를 최상단에 둠으로써 Context API가 전역에서 이루어지게 함
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginContainer />} />
          <Route path="/post" element={<PostingContainer />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
