import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AllChat from "./AllChat";
import SingleChat from "./SingleChat";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AllChat />}></Route>
          <Route path="/chat/:id" element={<SingleChat id={""} />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
