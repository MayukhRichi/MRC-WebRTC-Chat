import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ReceiverModal from "./ReceiverModal";
import SenderModal from "./SenderModal";

const UnloadListener = ({ disconnect }) => {
  useEffect(() => {
    // refresh + close tab
    window.onbeforeunload = () => {
      disconnect();
    };
    // go back
    window.onpopstate = () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

const Chat = ({ socket, setDataChannel, setStartChat }) => {
  const navigate = useNavigate();

  const { key } = useParams();
  const [clients, setClients] = useState([]);

  const [senderModalState, setSenderModalState] = useState(false);
  const [receiverModalState, setReceiverModalState] = useState(false);
  const [allowConfirm, setAllowConfirm] = useState(false);
  const [displayJoin, setDisplayJoin] = useState(false);
  const [allowJoin, setAllowJoin] = useState(false);

  const localConn = useRef(null);
  const [details, setDetails] = useState({
    partnerKey: null,
    description: null,
    icecandidates: null,
  });

  const sendMessage = useCallback(
    (messageType, messageBody) => {
      socket.emit("client-message", {
        from: key,
        to: "server",
        type: messageType,
        message: messageBody,
      });
    },
    [key, socket]
  );

  useEffect(() => {
    sendMessage("register", null);
    // sendMessage("ping", "Hello server");

    socket.on("server-message", (data) => {
      switch (data.type) {
        case "ping-ack":
          console.log(data.message);
          break;

        case "pre-user-update":
          sendMessage("user-update-request", null);
          break;

        case "user-update":
          if (data.to === "ALL") {
            data.message.splice(data.message.indexOf(key), 1);
            setClients(data.message);
          } else setClients(data.message);
          break;

        case "connect-request":
          setDetails(JSON.parse(data.message));
          setReceiverModalState(true);
          break;

        case "line-busy":
          alert("Line busy");
          setDetails({
            partnerKey: null,
            description: null,
            icecandidates: null,
          });
          setSenderModalState(false);
          sendMessage("user-update-request", null);
          break;

        case "confirm-request":
          setDetails(JSON.parse(data.message));
          setAllowConfirm(true);
          break;

        case "connect-failure":
          alert("Connection declined");
          setDetails({
            partnerKey: null,
            description: null,
            icecandidates: null,
          });
          setSenderModalState(false);
          sendMessage("user-update-request", null);
          break;

        case "connect-success":
          setAllowJoin(true);
          break;

        case "start-chat-request":
          setStartChat(true);
          socket.disconnect();
          break;

        default:
          console.log(`Unknown type: ${data.type}`);
          break;
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectToClient = (partnerKey) => {
    // creating a new datachannel
    localConn.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setDataChannel(localConn.current.createDataChannel("channel"));

    // adding event listeners for icecandidate
    let iceCandidates = [];
    localConn.current.addEventListener("icecandidate", (event) => {
      if (event && event.candidate == null) {
        console.log("icecandidate search complete");
        sendMessage(
          "connect",
          JSON.stringify({
            partnerKey: partnerKey,
            description: localConn.current.localDescription,
            icecandidates: iceCandidates,
          })
        );
        setSenderModalState(true);
      } else if (event.candidate) {
        iceCandidates.push(event.candidate);
      }
    });

    // creating an offer for the new datachannel
    localConn.current
      .createOffer()
      .then((offer) => {
        localConn.current.setLocalDescription(offer);
      })
      .then(() => {
        console.log("Sender: offer initiated");
      });
  };

  const acceptConnectRequest = () => {
    // listening to datachannel event
    localConn.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    localConn.current.ondatachannel = (event) => {
      setDataChannel(event.channel);
    };

    // adding event listeners for icecandidate
    let iceCandidates = [];
    localConn.current.addEventListener("icecandidate", (event) => {
      if (event && event.candidate == null) {
        console.log("icecandidate search complete");
        sendMessage(
          "connect-request-confirmed",
          JSON.stringify({
            partnerKey: details.partnerKey,
            description: localConn.current.localDescription,
            icecandidates: iceCandidates,
          })
        );
        setDisplayJoin(true);
      } else if (event.candidate) {
        iceCandidates.push(event.candidate);
      }
    });

    // accepting the offer
    localConn.current.setRemoteDescription(details.description).then(() => {
      console.log("Receiver: offer accepted");
    });

    // adding proposed icecandidates
    details.icecandidates.forEach((candidate) => {
      localConn.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // creating the answer
    localConn.current
      .createAnswer()
      .then((answer) => localConn.current.setLocalDescription(answer))
      .then(() => {
        console.log("Receiver: answer initiated");
      });
  };

  const confirmConnectRequest = () => {
    // accepting the offer
    localConn.current
      .setRemoteDescription(details.description)
      .then(() => {
        // adding proposed icecandidates
        details.icecandidates.forEach((candidate) => {
          localConn.current.addIceCandidate(new RTCIceCandidate(candidate));
        });
      })
      .then(() => {
        console.log("Sender: answer accepted");

        sendMessage("confirmed", details.partnerKey);
        setSenderModalState(false);
      })
      .then(() => {
        navigate(`/${key}/${details.partnerKey}`);
      });
  };

  return (
    <>
      <UnloadListener disconnect={() => socket.disconnect()} />

      <div className="flex justify-center">
        <h2 className="card-self">{key}</h2>
      </div>

      <div className="flex flex-col content-center h-1/2 overflow-y-scroll">
        {clients.map((clientKey, index) => (
          <button
            key={index}
            className="card-primary"
            onClick={() => {
              setDetails({
                partnerKey: clientKey,
                description: null,
                icecandidates: null,
              }); // dummy partner
              connectToClient(clientKey);
            }}
          >
            {clientKey}
          </button>
        ))}
      </div>

      <SenderModal
        state={senderModalState}
        keyVal={details.partnerKey}
        allowConfirm={allowConfirm}
        confirmCallback={confirmConnectRequest}
      />
      <ReceiverModal
        state={receiverModalState}
        keyVal={details.partnerKey}
        displayJoin={displayJoin}
        allowJoin={allowJoin}
        acceptCallback={acceptConnectRequest}
        declineCallback={() => {
          sendMessage("connect-request-declined", details.partnerKey);
          setReceiverModalState(false);
          sendMessage("user-update-request", null);
        }}
        joinCallback={() => {
          setStartChat(true);
          sendMessage("start-chat", details.partnerKey);

          setReceiverModalState(false);
          socket.disconnect();
          navigate(`/${key}/${details.partnerKey}`);
        }}
      />
    </>
  );
};

export default Chat;
