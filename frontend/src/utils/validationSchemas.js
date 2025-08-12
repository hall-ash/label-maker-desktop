import { z } from 'zod';

const startLabelSchema = z.string()
                .refine(s => {
                  const startLabelPattern = /^[a-zA-Z]\d{1,2}$/;
                  return s === "" || startLabelPattern.test(s)
                }, { message: 'Label coordinates start with the column letter followed by the row number.' }
              );


// only allow valid values for dimensions of label sheet
// e.g., if num rows = 17; don't allow user to input a18,..., e18
const skipLabelsSchema = z
  .string()
  .transform((skips) => {
    // Clean up whitespace and newlines
    return skips
      .replace(/[ \t\f\v\r]+/g, '') // Remove all whitespace except newlines
      .replace(/^\n+|\n+$/g, '')    // Remove newlines from the start and end of the string
      .replace(/\n+/g, '\n');       // Replace consecutive newlines with a single newline
  })
  .refine(
    (skips) => {
      if (!skips) return true;

      // Define the regex pattern to validate skip labels format
      const pattern = /^(\d+:\w\d+(?:-\w\d+)?(?:,\w\d+(?:-\w\d+)?)*)?(?:\n\d+:\w\d+(?:-\w\d+)?(?:,\w\d+(?:-\w\d+)?)*)*$/;
      return pattern.test(skips);
    },
    {
      message: "Format => Page#: Labels to skip", // Error message shown when regex fails
    }
  );

const numberInputSchema = z.string()
  .transform(value => parseFloat(value)) // Transform string input to a float
  .refine(number => !isNaN(number) && isFinite(number), { message: 'Enter a number' }); 

const nonnegativeNumberInputSchema = numberInputSchema.refine(number => number >= 0, { message: 'Enter a number greater than or equal to 0' });

const quantitySchema = z.coerce.number({ invalid_type_error: "Quantity must be a number", })
                       .nonnegative({ message: 'Quantity can\'t be negative' })
                       .lte(1000, { message: 'Max quantity is 1000' })
                       .int({ message: 'Quantity must be an integer' });

const aliquotSchema = z.object({
  aliquottext: z.string(),
  number: quantitySchema,
});

const labelSchema = z.object({
  labeltext: z.string(),
  labelcount: quantitySchema,
  displayAliquots: z.boolean(),
  aliquots: z.array(aliquotSchema),
});

const labelsSchema = z
  .array(labelSchema)
  .transform((labels) =>
    labels
      .map(({ labeltext, aliquots, labelcount, displayAliquots }) => ({
        name: labeltext.trim(),
        count: displayAliquots ? 0 : labelcount,
        use_aliquots: displayAliquots,
        aliquots: aliquots
          .filter(aliquot => aliquot.number) 
          .map(({ aliquottext, number }) => ({ text: aliquottext, number })), 
      })).filter(label => (label.count > 0 && label.name) || (label.name && label.aliquots.length > 0))
  )
  .refine(labels => labels.length > 0, { message: "No labels to print" });


const settingsSchema = z.object({
  hasBorder: z.boolean(),
  textAnchor: z.union([
    z.literal('start'),
    z.literal('middle'),
    z.literal('end'),
  ]),
  fontSize: z.coerce.number({ invalid_type_error: "Font size must be a number", })
             .positive({ message: 'Font size must be greater than 0' })
             .lte(30, { message: 'Max font size is 30' }),
  padding: z.coerce.number({ invalid_type_error: "Padding must be a number", })
            .nonnegative({ message: 'Padding can\'t be negative' })
            .lte(4, { message: 'Max padding is 4' }),
});



// expected array, received string
const amountsSchema = z
  .string() // Input is expected to be a string
  .transform(amountsStr => {
    const amounts = amountsStr.match(/\d+(\.\d+)?/g); // Extract numbers from the string
    return amounts ? amounts.map(Number) : []; // Convert to an array of numbers
  })
  .refine(amounts => amounts.length > 0, { message: 'Provide at least one amount' });
 // The transformed value should be an array of numbers


const calculateAliquotsModalSchema = z.object({
  'concentration': z.string()
  .min(1, { message: "Enter a concentration" })  // Ensure it's not an empty string
  .transform((val) => val.trim())         // Optionally, trim whitespace
  .pipe(z.coerce.number({
    invalid_type_error: "Concentration must be a number",
  }).positive({ message: 'Concentration must be greater than 0' })),
  'volume': z.string()
  .min(1, { message: "Enter a volume" })  // Ensure it's not an empty string
  .transform((val) => val.trim())         // Optionally, trim whitespace
  .pipe(z.coerce.number({
    invalid_type_error: "Volume must be a number",
  }).positive({ message: 'Volume must be greater than 0' })),

  'amounts': amountsSchema,
});

const labelFormSchema = z.object({
  labels: labelsSchema,
  startLabel: z.optional(startLabelSchema),
  skipLabels: z.optional(skipLabelsSchema), 
});

const getLabelListErrors = (issues) => {
  
  return issues
    .filter(({ path }) => path[0] === 'labels' && path.length > 1)
    .reduce((labelListErrors, { path, message }) => {
      const labelIndex = path[1];
      const subError = {
        'path': path.slice(1),
        message,
      };
      return labelListErrors[labelIndex] ? labelListErrors[labelIndex].push(subError) : (labelListErrors[labelIndex] = [subError]);
      
    }, []);
};


const getErrors = parsedDataError => {
   // Check if there are any issues and reduce them to an object with error messages
  return parsedDataError?.issues?.reduce((msgs, issue) => {
    const { path: inputs, message } = issue; // Destructure path and message from the issue
    if (inputs.length > 0) { // Ensure path has at least one element
      msgs[inputs[0]] = message; // Map the first path element to the error message
    }
    return msgs;
  }, {}) || {}; // Return empty object if no errors
};


export { labelsSchema, skipLabelsSchema, startLabelSchema, getLabelListErrors, quantitySchema, settingsSchema, labelFormSchema, calculateAliquotsModalSchema, labelSchema, nonnegativeNumberInputSchema, aliquotSchema, getErrors };



