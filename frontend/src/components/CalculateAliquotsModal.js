import '../styles/CalculateAliquotsModal.css';
import { useState } from 'react';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label as RSLabel, Row, Col, InputGroup } from 'reactstrap';
import calculateAliquots from '../utils/calculateAliquots';
import { calculateAliquotsModalSchema } from '../utils/validationSchemas';
import ReactHookFormInput from './ReactHookFormInput';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

const CalculateAliquotsModal = ({ handleCalculateAliquotsClick }) => {

  const aliquotMassUnit = 'mg';
  const volumeUnit = 'mL';
  const concentrationUnit = 'mg/mL';

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      'concentration': '',
      'volume': '',
      'amounts': '',
    },
    resolver: zodResolver(calculateAliquotsModalSchema),
    mode: 'onTouched',
  });

  const onSubmit = data => {
    const { concentration, volume, amounts } = data;
    const aliquots = calculateAliquots(concentration, volume, amounts, aliquotMassUnit);
    handleCalculateAliquotsClick(aliquots);
    toggle();
  }

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  const handleCancel = () => {
    toggle();
    reset();
  }

  return (
    <div className="button-div">
      <Button onClick={toggle} outline color="secondary" className="calculate-aliquots-btn">
        Calculate Aliquots
      </Button>
      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={handleCancel}>Calculate Aliquots</ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col>
                <RSLabel for="concentration">Concentration</RSLabel>
              </Col>
              <Col className="mb-2">
                <InputGroup>
                <ReactHookFormInput
                  label="concentration"
                  control={control}
                  errors={errors}
                  inputGroupText={concentrationUnit}
                />
                </InputGroup>
               
              </Col>
            </Row>
            <Row>
              <Col>
                <RSLabel for="volume">Total Volume</RSLabel>
              </Col>
              <Col>
                <InputGroup>

                 <ReactHookFormInput
                  label="volume"
                  control={control}
                  errors={errors}
                  inputGroupText={volumeUnit}
                />
                </InputGroup>
               
                </Col>
            </Row>
            <FormGroup className="mt-2">
              <RSLabel for="amounts">Aliquot Amounts in {aliquotMassUnit}</RSLabel>
              <ReactHookFormInput
                  label="amounts"
                  control={control}
                  errors={errors}
                />
              
            </FormGroup>
        
          </Form>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Calculate
          </Button>{' '}
          <Button color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );

};

export default CalculateAliquotsModal;
