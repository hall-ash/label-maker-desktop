import '../styles/Label.css';
import { useState } from "react";
import Aliquot from "./Aliquot";
import CalculateAliquotsModal from './CalculateAliquotsModal';
import { Row, Col, FormFeedback, Label as RSLabel, FormGroup, Input, Container, Button } from 'reactstrap';
import { FaPlusSquare, FaTimes } from 'react-icons/fa';
import { quantitySchema } from '../utils/validationSchemas';


const Label = ({ id, labeltext, labelCount, aliquots, removeLabel, addAliquot, removeAliquot, onChange, setAliquots, displayAliquots }) => {
  const aliquotComponents = aliquots.map(({ id: aliquotId, aliquottext, number }) => (
    <Aliquot
      id={aliquotId}
      key={aliquotId}
      aliquottext={aliquottext}
      number={number}
      remove={() => removeAliquot(id, aliquotId)}
      onChange={(e) => onChange(e, id, aliquotId)}
    />
  ));

  const handleClick = () => addAliquot(id);
  const handleCalculateAliquotsClick = (aliquots) => setAliquots(id, aliquots);
  const handleRemoveLabel = () => removeLabel(id);
  const toggleShowAliquots = () => {
    handleChange({ target: { name: "displayAliquots", checked: !displayAliquots, value: !displayAliquots } });
  };

  const [errors, setErrors] = useState({
    labelCount: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;

    onChange(e, id);

    if (name === "labelcount") {
      const parsedLabelCount = quantitySchema.safeParse(value);

      if (!parsedLabelCount.success) {
        const errorMsg = parsedLabelCount.error.errors[0].message;
        setErrors(prev => ({ ...prev, labelCount: errorMsg }));
      } else {
        setErrors(prev => ({ ...prev, labelCount: "" }));
      }
    }

  };

  return (
    <Container className="label-container">
      <div className="remove-label-icon">
        <FaTimes onClick={handleRemoveLabel} />
      </div>
      <Row className="mt-1">
        <FormGroup className="w-100">
          <RSLabel for="labeltext" className="label-title">Label Text</RSLabel>
          <Input
            id="labeltext"
            name="labeltext"
            type="textarea"
            value={labeltext}
            onChange={handleChange}
            rows={4}
          />
        </FormGroup>
      </Row>
      <Row className="mt-1 label-count-and-add-aliquots-container">
        {!displayAliquots && (
          <Col xs="4">
            <FormGroup className="label-count-container">
              <RSLabel className="label-count" for="labelcount">Label Count</RSLabel>
              <div className="label-count-field">
              <Input
                id="labelcount"
                name="labelcount"
                type="text"
                value={labelCount}
                onChange={handleChange}
                bsSize='sm'
                className="label-count-input"
                invalid={Boolean(errors.labelCount)}
              />
               <FormFeedback>
                {errors.labelCount}
              </FormFeedback>
              </div>
            </FormGroup>
          </Col>
        )}
        <Col className="text-end">
          <Button color="primary" size="sm" onClick={toggleShowAliquots}>
            {displayAliquots ? "Remove Aliquots" : "Add Aliquots"}
          </Button>
        </Col>
      </Row>
      {displayAliquots && (
        <div>
          <Row className="mt-3 align-items-center">
            <Col>
              <RSLabel className="aliquots-title">Aliquots</RSLabel>
            </Col>
            <Col className="text-end">
              <CalculateAliquotsModal handleCalculateAliquotsClick={handleCalculateAliquotsClick} />
            </Col>
          </Row>
          <div className="aliquots-container">
            <div className="aliquots-column">
              {aliquotComponents}
            </div>
            <div className="add-aliquot-btn-column">
              <FaPlusSquare className="add-aliquot-btn" onClick={handleClick} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Label;
