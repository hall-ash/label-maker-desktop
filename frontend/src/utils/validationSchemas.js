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
      message: "Format => Page#: Labels to skip (See About Page)", 
    }
  );


const quantitySchema = z.coerce.number({ invalid_type_error: "Quantity must be a number" })
  .nonnegative({ message: "Quantity can't be negative" })
  .lte(1000, { message: "Max quantity is 1000" })
  .int({ message: "Quantity must be an integer" });

const aliquotSchema = z.object({
  aliquottext: z.string(),
  number: quantitySchema,  // '' -> 0, then normal rules
});

/** Branch: NOT using aliquots -> validate labelcount; ignore aliquots */
const labelWhenCount = z.object({
  displayAliquots: z.literal(false),
  labeltext: z.string(),
  labelcount: quantitySchema,                 // enforce here
  aliquots: z.any().optional().transform(() => []), // ignored
});

/** Branch: using aliquots -> validate aliquots; ignore labelcount */
const labelWhenAliquots = z.object({
  displayAliquots: z.literal(true),
  labeltext: z.string(),
  labelcount: z.any().optional().transform(() => 0), // forced 0, never errors
  aliquots: z.array(aliquotSchema).transform(as => as.filter(a => a.number > 0)),
});

export const labelSchema = z.discriminatedUnion("displayAliquots", [
  labelWhenCount,
  labelWhenAliquots,
]);

export const labelsSchema = z
  .array(labelSchema)
  .transform(labels =>
    labels
      .map(({ labeltext, displayAliquots, labelcount, aliquots }) => ({
        name: (labeltext ?? "").trim(),
        use_aliquots: displayAliquots,
        count: displayAliquots ? 0 : (labelcount ?? 0),
        aliquots: displayAliquots ? aliquots
          .filter(aliquot => aliquot.number) 
          .map(({ aliquottext, number }) => ({ text: aliquottext, number })) 
           : [],
      }))
      .filter(l =>
        l.name && (l.count > 0 || (l.use_aliquots && l.aliquots.length > 0))
      )
  )
  .refine(arr => arr.length > 0, { message: "No labels to print" });



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


const amountsSchema = z
  .string() 
  .transform(amountsStr => {
    const amounts = amountsStr.match(/\d+(\.\d+)?/g); // Extract numbers from the string
    return amounts ? amounts.map(Number) : []; 
  })
  .refine(amounts => amounts.length > 0, { message: 'Provide at least one amount' });


const calculateAliquotsModalSchema = z.object({
  'concentration': z.string()
  .min(1, { message: "Enter a concentration" })  
  .transform((val) => val.trim())         
  .pipe(z.coerce.number({
    invalid_type_error: "Concentration must be a number",
  }).positive({ message: 'Concentration must be greater than 0' })),
  'volume': z.string()
  .min(1, { message: "Enter a volume" })  
  .transform((val) => val.trim())         
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


export { skipLabelsSchema, startLabelSchema, quantitySchema, settingsSchema, labelFormSchema, calculateAliquotsModalSchema };



