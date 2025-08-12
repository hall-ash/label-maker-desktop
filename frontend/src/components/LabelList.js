import '../styles/LabelList.css'
import Label from "./Label";
import { Button } from 'reactstrap';

const LabelList = ({ labels, addLabel, removeLabel, addAliquot, removeAliquot, onChange, setLabelAliquots }) => {
  
  const labelComponents = labels.map(({ id, labeltext, aliquots, labelcount, displayAliquots }, idx) => {
    return (
    
    <div key={idx}>
      <Label 
        id={id}
        labeltext={labeltext}
        labelCount={labelcount}
        aliquots={aliquots}
        removeLabel={removeLabel}
        addAliquot={addAliquot}
        removeAliquot={removeAliquot}
        onChange={onChange}
        setAliquots={setLabelAliquots}
        displayAliquots={displayAliquots}
      />
    </div>
      )
    }
  );

  return (
    <div className="label-list-container">
      {labelComponents}
      <Button className="add-label-btn" outline color="primary" size="sm" type="button" onClick={addLabel}>Add Label</Button>
    </div>
  );

}

export default LabelList;
