import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

const UnloadListener = ({ disconnect }) => {
  useEffect(() => {
    // go back
    window.onpopstate = () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

const Room = ({ dataChannel, startChat }) => {
  const { partnerKey } = useParams();
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const addChat = (chatType, chatText) => {
    setChats((current) => [
      ...current,
      { chatType: chatType, chatText: chatText },
    ]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendData = (data) => {
    if (data.length) {
      inputRef.current.value = "";
      dataChannel.send(data);
      addChat("chat-self", data);
    }
  };

  useEffect(() => {
    const receiveData = (data) => {
      addChat("chat-partner", data);
    };

    dataChannel.onopen = () => {
      console.log("channel opened");
    };
    dataChannel.onclose = () => {
      console.log("channel closed");
    };
    dataChannel.onmessage = (event) => {
      receiveData(event.data);
    };
    dataChannel.onerror = () => {
      console.log("some error occured");
    };
  }, [dataChannel]);

  return (
    <>
      <UnloadListener disconnect={() => dataChannel.close()} />

      <div className="flex justify-center">
        <h2 className="card-secondary">{partnerKey}</h2>
      </div>

      <div className="mt-4 h-1/2 overflow-y-scroll">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col justify-end h-fit min-h-full w-2/3 p-2 bg-zinc-100 rounded-lg shadow">
            {chats.map((each, index) => (
              <p key={index} className={each.chatType}>
                {each.chatText}
              </p>
            ))}
          </div>
        </div>
        <div ref={chatEndRef} />
      </div>

      <div className="flex justify-center">
        <input
          type="text"
          className="input-primary"
          placeholder="message"
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendData(inputRef.current.value);
          }}
        />
        {startChat ? (
          <button
            className="btn-primary"
            onClick={() => sendData(inputRef.current.value)}
          >
            send
          </button>
        ) : (
          <button className="btn-disabled">waiting&nbsp;.&nbsp;.&nbsp;.</button>
        )}
      </div>
    </>
  );
};

export default Room;
