import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';

const SubmissionAlertModal = ({ isOpen, toggle, errorMessage }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Error</ModalHeader>
      <ModalBody>
        <p>{errorMessage}</p>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalBody>
    </Modal>
  );
};

export default SubmissionAlertModal;
