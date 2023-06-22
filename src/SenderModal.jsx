import Modal from "react-modal";

const SenderModal = ({ state, keyVal, allowConfirm, confirmCallback }) => {
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
        console.log("OUTGOING CALL REQUEST");
      }}
      style={customStyle}
      contentLabel="Dialogue Box"
    >
      <div className="flex justify-center">
        <h2 className="card-secondary">{keyVal}</h2>
      </div>

      <div className="flex justify-center">
        {allowConfirm ? (
          <button className="btn-primary" onClick={confirmCallback}>
            confirm
          </button>
        ) : (
          <button className="btn-disabled">waiting&nbsp;.&nbsp;.&nbsp;.</button>
        )}
      </div>
    </Modal>
  );
};

export default SenderModal;
