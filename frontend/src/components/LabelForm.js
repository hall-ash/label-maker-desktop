import '../styles/LabelForm.css'
import { useState, useEffect, useRef } from "react";
import LabelList from "./LabelList";
import LoadingSpinner from './LoadingSpinner';
import { Form, FormFeedback, Button, Label as RSLabel, Input, Row, Col } from 'reactstrap';
import SkipLabelsDropdown from "./SkipLabelsDropdown";
import { labelFormSchema, startLabelSchema, skipLabelsSchema } from '../utils/validationSchemas';
import SubmissionAlertModal from './SubmissionAlertModal';
import { makeAliquot, makeLabel } from '../utils/formUtils';
import { useAppSettings } from '../context/AppSettingsContext';

const LabelForm = () => {
  const { labelSettings } = useAppSettings();

  const labelSettingsRef = useRef(labelSettings);
  useEffect(() => {
    labelSettingsRef.current = labelSettings;
  }, [labelSettings]);

  const { 
    generatePDF, 
    regeneratePDF, 
    onRegeneratePDF, 
    offRegeneratePDF,
    onPDFGenerationStarted,
    offPDFGenerationStarted 
  } = window.electron;

  const [waitingForApi, setWaitingForApi] = useState(false);

  // const pendingRef = useRef(false);
  // const delayTimerRef = useRef(null);
  // const hardTimeoutRef = useRef(null);

  // // call this when you begin an async op
  // const startSpinnerWithDelay = (delayMs = 400, hardTimeoutMs = 30000) => {
  //   // mark pending immediately
  //   pendingRef.current = true;

  //   // show spinner only if still pending after delay
  //   delayTimerRef.current = setTimeout(() => {
  //     if (pendingRef.current) {
  //       setWaitingForApi(true);
  //     }
  //   }, delayMs);

  //   // optional hard timeout: stop spinner & show error if something hangs
  //   hardTimeoutRef.current = setTimeout(() => {
  //     if (pendingRef.current) {
  //       pendingRef.current = false;
  //       setWaitingForApi(false);
  //       showError('PDF creation is taking longer than expected. Please try again.');
  //     }
  //   }, hardTimeoutMs);
  // };

  // const stopSpinner = () => {
  //   pendingRef.current = false;
  //   if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
  //   if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
  //   setWaitingForApi(false);
  // };

  // useEffect(() => {
  //   return () => {
  //     if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
  //     if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
  //   };
  // }, []);

  const [errors, setErrors] = useState({
    startLabel: '',
    skipLabels: '',
    labels: '',
  });
  const [pdfError, setPdfError] = useState('');
  const [submissionAlertModalOpen, setSubmissionAlertModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    startLabel: '',
    skipLabels: '',
    labels: Array.from({ length: 1 }, makeLabel),
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const setFieldError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  };

  const fieldSchemas = {
    startLabel: startLabelSchema,
    skipLabels: skipLabelsSchema,
  };

  const validateField = (fieldName, value) => {
    const schema = fieldSchemas[fieldName];
    if (!schema) return;

    const result = schema.safeParse(value);
    setFieldError(fieldName, result.success ? '' : result.error.format());
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const showError = (message) => {
    setPdfError(message);
    setSubmissionAlertModalOpen(true);
  };

  const handleCloseSubmissionAlertModal = () => {
    setSubmissionAlertModalOpen(false);
    setPdfError('');
  };

  const handleChange = (e, labelId, aliquotId) => {
    const { name, value } = e.target;
    if (!labelId) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      labels: prev.labels.map(label => {
        if (label.id !== labelId) return label;

        if (aliquotId) {
          const updatedAliquots = label.aliquots.map(aliquot =>
            aliquot.id === aliquotId ? { ...aliquot, [name]: value } : aliquot
          );
          return { ...label, aliquots: updatedAliquots };
        }

        return { ...label, [name]: value };
      })
    }));
  };

  const addLabel = () => {
    setFormData(prev => ({
      ...prev,
      labels: [...prev.labels, makeLabel()]
    }));
  };

  const removeLabel = labelId => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label.id !== labelId)
    }));
  };

  const addAliquot = labelId => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.map(label =>
        label.id === labelId
          ? { ...label, aliquots: [...label.aliquots, makeAliquot()] }
          : label
      )
    }));
  };

  const removeAliquot = (labelId, aliquotId) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.map(label =>
        label.id === labelId
          ? { ...label, aliquots: label.aliquots.filter(aliquot => aliquot.id !== aliquotId) }
          : label
      )
    }));
  };

  const setLabelAliquots = (labelId, aliquots) => {

    const calculatedAliquots = aliquots.map(aliquot => ({ ...aliquot, id: makeAliquot().id }));
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.map(label =>
        label.id === labelId
          ? { ...label, aliquots: calculatedAliquots }
          : label
      )
    }));
  };

  useEffect(() => {
    const startSpinner = () => {
      setWaitingForApi(true);
    };

    onPDFGenerationStarted(startSpinner);

    return () => {
      offPDFGenerationStarted(startSpinner);
    };
  }, [onPDFGenerationStarted, offPDFGenerationStarted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedData = labelFormSchema.safeParse(formData);
    const newErrors = parsedData.success ? {} : parsedData.error.format();
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (!parsedData.success) {
      if (newErrors.labels) setSubmissionAlertModalOpen(true);
      return;
    }

    const { labels, startLabel, skipLabels } = parsedData.data;
    const validatedFormData = {
      labels,
      start_label: startLabel,
      skip_labels: skipLabels,
      border: labelSettings.hasBorder,
      padding: labelSettings.padding,
      font_size: labelSettings.fontSize,
      text_anchor: labelSettings.textAnchor,
    };

    //startSpinnerWithDelay(400);
    setWaitingForApi(true);

    try {
      const response = await generatePDF(validatedFormData);
      if (!['success', 'canceled'].includes(response.status)) {
        showError('PDF creation failed: ' + response.message);
      }
    } catch (error) {
      console.error('Unexpected error submitting form:', error);
      showError('An unexpected error occurred while creating the PDF.');
    } finally {
      //stopSpinner();
      setWaitingForApi(false);
    }
  };


  useEffect(() => {
    const handleRegenerate = async () => {

      const parsedData = labelFormSchema.safeParse(formDataRef.current);
      const newErrors = parsedData.success ? {} : parsedData.error.format();
      setErrors(prev => ({ ...prev, ...newErrors }));

      if (!parsedData.success) {
        if (newErrors.labels) setSubmissionAlertModalOpen(true);
        return;
      }

      const { labels, startLabel, skipLabels } = parsedData.data;
      const ls = labelSettingsRef.current; 
      const validatedFormData = {
        labels,
        start_label: startLabel,
        skip_labels: skipLabels,
        border: ls.hasBorder,
        padding: ls.padding,
        font_size: ls.fontSize,
        text_anchor: ls.textAnchor,
      };

      //startSpinnerWithDelay(400);
      setWaitingForApi(true);

      try {
        const response = await regeneratePDF(validatedFormData);
        if (!['success', 'canceled'].includes(response.status)) {
          showError('PDF creation failed: ' + response.message);
        }
      } catch (error) {
        console.error('Unexpected error submitting form:', error);
        showError('An unexpected error occurred while creating the PDF.');
      } finally {
        //stopSpinner();
        setWaitingForApi(false);
      }
    };
    onRegeneratePDF(handleRegenerate);
    return () => offRegeneratePDF(handleRegenerate);
  }, [onRegeneratePDF, offRegeneratePDF]);

  return waitingForApi ? (
    <div className="loading-container">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="label-form-container">
      <Form onSubmit={handleSubmit}>
        <Row className="start-label-row">
          <Col className="mt-3" xs="auto">
            <RSLabel for="startLabel" className="start-on-label">Start On Label:</RSLabel>
          </Col>
          <Col>
            <Input
              id="startLabel"
              name="startLabel"
              type="text"
              value={formData.startLabel}
              onChange={handleChange}
              className="start-label-input"
              bsSize='sm'
              invalid={!!errors.startLabel}
              onBlur={handleBlur}
            />
            <FormFeedback>
              {errors.startLabel?._errors?.join(', ') || ' '}
            </FormFeedback>
          </Col>
        </Row>

        <SkipLabelsDropdown
          skipLabelsValue={formData.skipLabels}
          onChange={handleChange}
          error={errors.skipLabels?._errors?.join(', ')}
          onBlur={handleBlur}
        />

        <LabelList
          labels={formData.labels}
          addLabel={addLabel}
          removeLabel={removeLabel}
          addAliquot={addAliquot}
          removeAliquot={removeAliquot}
          onChange={handleChange}
          setLabelAliquots={setLabelAliquots}
        />

        <div className="form-submit-container">
          <Button color="primary" type="submit" disabled={waitingForApi}>Create Labels</Button>
        </div>
      </Form>

      <SubmissionAlertModal
        isOpen={submissionAlertModalOpen}
        toggle={handleCloseSubmissionAlertModal}
        errorMessage={pdfError || errors.labels?._errors}
      />
    </div>
  );
};

export default LabelForm;
