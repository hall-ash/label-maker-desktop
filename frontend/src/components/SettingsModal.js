import { useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, 
  FormGroup, Label as RSLabel, Spinner
} from 'reactstrap';
import { settingsSchema } from '../utils/validationSchemas.js';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import ReactHookFormInput from './ReactHookFormInput';
import { useAppSettings } from '../context/AppSettingsContext.js';

const SettingsModal = ({ isOpen, toggle }) => {
  const { labelSettings, updateLabelSettings } = useAppSettings();

  const {
    control, handleSubmit, formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: labelSettings,
    resolver: zodResolver(settingsSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (newSettings) => {
    await updateLabelSettings(newSettings);
    toggle(); 
  };

  const handleCancel = () => {
    reset(labelSettings); 
    toggle(); 
  };

  useEffect(() => {
    if (isOpen && labelSettings) {
      reset(labelSettings);
    }
  }, [isOpen, labelSettings, reset]);
  
  return (
    !labelSettings ? (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner color="primary" />
      </div>
    ) : (
    <Modal isOpen={isOpen} toggle={handleCancel}>
      <ModalHeader toggle={handleCancel}>Label Settings</ModalHeader>
      <ModalBody>
        <FormGroup>
          <ReactHookFormInput label="padding" control={control} errors={errors} labelText="Padding" />
        </FormGroup>
        <FormGroup>
          <ReactHookFormInput label="fontSize" control={control} errors={errors} labelText="Font Size" />
        </FormGroup>
        <RSLabel for="textAnchor" className="font-weight-bold">Alignment</RSLabel>
        <FormGroup>
          <Controller
            control={control}
            name="textAnchor"
            render={({ field }) => (
              <Input type="select" id="textAnchor" {...field}>
                <option value="middle">Middle</option>
                <option value="start">Start</option>
                <option value="end">End</option>
              </Input>
            )}
          />
        </FormGroup>
        <FormGroup check className="d-flex align-items-center">
          <Controller
            control={control}
            name="hasBorder"
            render={({ field }) => (
              <Input
                type="checkbox"
                id="border"
                checked={field.value}
                onChange={e => field.onChange(e.target.checked)}
              />
            )}
          />
          <RSLabel for="border" className="ms-2">Add Border</RSLabel>
        </FormGroup>
      </ModalBody>
      <ModalFooter className="justify-content-end">
        <Button color="secondary" onClick={handleCancel}>Cancel</Button>
        <Button color="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Save</Button>
      </ModalFooter>
    </Modal> 
    )
  );
};

export default SettingsModal;



