import { createRoot } from "react-dom/client";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { v4 } from "uuid";
import io from "socket.io-client";

import Chat from "./Chat";
import Room from "./Room";

const Controls = ({ keyVal, setSocket }) => {
  return (
    <div className="flex justify-center">
      <Link to={`/${keyVal}`}>
        <button
          className="btn-primary"
          onClick={() => {
            setSocket(io.connect("https://my-ws-server1.onrender.com/"));
          }}
        >
          connect
        </button>
      </Link>
      <button
        className="btn-primary"
        onClick={() => {
          window.location.reload(false);
        }}
      >
        refresh
      </button>
    </div>
  );
};

const App = () => {
  const key = useRef(v4());
  const [isServerRunning, toggleServerRunning] = useState(false);
  const [socket, setSocket] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [startChat, setStartChat] = useState(false);

  useEffect(() => {
    fetch("https://my-ws-server1.onrender.com/")
      .then((resp) => {
        if (resp.ok) console.log("server: test success");
        else throw new Error("server: test failure");
      })
      .then(() => toggleServerRunning(true))
      .catch(() => {
        throw new Error("server: test failure");
      });
  }, []);

  return (
    <BrowserRouter>
      <header className="flex justify-center">
        <h1 className="mb-4 text-6xl font-extrabold text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-500">
            WebRTC Chat App
          </span>
        </h1>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            isServerRunning ? (
              <Controls keyVal={key.current} setSocket={setSocket} />
            ) : null
          }
        />
        <Route
          path="/:key"
          element={
            <Chat
              socket={socket}
              setDataChannel={setDataChannel}
              setStartChat={setStartChat}
            />
          }
        />
        <Route
          path="/:key/:partnerKey"
          element={<Room dataChannel={dataChannel} startChat={startChat} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
