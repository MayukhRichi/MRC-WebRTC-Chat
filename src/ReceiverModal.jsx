import Modal from "react-modal";

const ReceiverModal = ({
  state,
  keyVal,
  displayJoin,
  allowJoin,
  acceptCallback,
  declineCallback,
  joinCallback,
}) => {
  Modal.setAppElement("#root");
  const customStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
    },
  };

  return (
    <Modal
      isOpen={state}
      onAfterOpen={() => {
        console.log("INCOMING CALL REQUEST");
      }}
      style={customStyle}
      contentLabel="Dialogue Box"
    >
      <div className="flex justify-center">
        <h2 className="card-secondary">{keyVal}</h2>
      </div>

      <div className="flex justify-center">
        {displayJoin ? (
          allowJoin ? (
            <button className="btn-primary" onClick={joinCallback}>
              join
            </button>
          ) : (
            <button className="btn-disabled">
              waiting&nbsp;.&nbsp;.&nbsp;.
            </button>
          )
        ) : (
          <>
            <button className="btn-primary" onClick={acceptCallback}>
              accept
            </button>
            <button className="btn-primary" onClick={declineCallback}>
              decline
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ReceiverModal;
