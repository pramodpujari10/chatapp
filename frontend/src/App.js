import "./App.css";

import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";
import Signup from "./components/Authentication/Signup";
import Login from "./components/Authentication/Login";
import Logins from "./components/Authentication/Logins";
import Signups from "./components/Authentication/Signups";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* <Route path="logins" element={<Logins />} />
        <Route index path="/" element={<Signups />} /> */}
        {/* <Route path="/login" element={<Login />} />
        <Route path="/" element={<Signup />} /> */}
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
    </div>
  );
}

export default App;
