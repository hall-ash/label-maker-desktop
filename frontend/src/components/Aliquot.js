import { useState } from "react";
import { Input, InputGroup, FormFeedback } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';
import { quantitySchema } from "../utils/validationSchemas";
import '../styles/Aliquot.css';

const Aliquot = ({ aliquottext, number, remove, onChange }) => {
  const [errors, setErrors] = useState({
    number: '',
  });
  const handleChange = e => {  
    const { name, value } = e.target;
    onChange(e);

    if (name === 'number') {
      const parsedAliquotNumber = quantitySchema.safeParse(value);

      if (!parsedAliquotNumber.success) {
        const errorMsg = parsedAliquotNumber.error.errors[0].message;
        setErrors(prev => ({ ...prev, number: errorMsg }));
      } else {
        setErrors(prev => ({ ...prev, number: '' }));
      }
    }
  };

  return (
    <div className="aliquot-input-container">
        <InputGroup>
          <Input
            id="aliquottext"
            name="aliquottext"
            placeholder="text"
            value={aliquottext}
            onChange={handleChange}
            type="text"
            bsSize="sm"
            className="aliquot-text-input"
          />
        </InputGroup>
        <div className="number-and-trash">
  <div className="number-field">
    <Input
      id="number"
      name="number"
      type="text"
      placeholder="number"
      value={number}
      bsSize="sm"
      className="aliquot-number-input"
      onChange={handleChange}
      invalid={Boolean(errors.number)}
    />
    <FormFeedback>{errors.number}</FormFeedback>
  </div>
  <FaTrash onClick={remove} className="trash-icon" />
</div>
     
    </div>
  );
}

export default Aliquot;
