import { Input, FormFeedback, InputGroupText, Label as RSLabel } from 'reactstrap';
import { Controller } from "react-hook-form";

const ReactHookFormInput = ({ label, control, errors, type="text", bsSize="sm", required=false, className="", inputGroupText="", labelText="" }) => {
  return (
    <>
      {labelText && <RSLabel for={label}>{labelText}</RSLabel>}
      <Controller
        control={control}
        name={label}
        render={({ field }) => (
          <Input
            id={label}
            type={type}
            bsSize={bsSize}
            required={required}
            className={className ? className : `label-${label}-input`}
            invalid={!!errors[label]}
            {...field} 
          />
        )}
      />
      {inputGroupText && 
        <InputGroupText>{inputGroupText}</InputGroupText>
      }
      <FormFeedback>
        {errors[label]?.message}
      </FormFeedback>
    </>
  );
};

export default ReactHookFormInput;
