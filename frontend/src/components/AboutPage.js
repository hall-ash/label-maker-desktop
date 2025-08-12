import { Container } from 'reactstrap';

const AboutPage = () => {
  return (
    <Container className="col-md-7 mt-5">
      <h2 className="mb-4">About</h2>
      
      <p>
        Columns are indexed by letters, and rows are indexed by numbers.
        The first label coordinate is <strong>A1</strong>; the last label coordinate
        on a sheet with 5 columns and 17 rows is <strong>E17</strong>.
      </p>
    
      <p>
        You can adjust font size, text alignment, etc. by clicking
        the gear icon. Label text is automatically resized to fit the label dimensions.
      </p>

      <h4 className="mt-4">Start on Label</h4>
      <p>
        You can start printing at a specific label coordinate. For example, entering <strong>B2 </strong> 
         in the <strong>Start On Label</strong> input field will print labels starting on column 2, row 2 of the sheet.
        Leaving it blank will start printing on the first label coordinate (A1).
      </p>

      <h4 className="mt-4">Skipping Labels</h4>
      <p>
        You can prevent printing on specific label coordinates by adding them to the 
        <strong> Skip Labels </strong> input field.
      </p>

      <h5 className="mt-3">Examples:</h5>
      <ul className="list-unstyled">
        <li className="mb-2">
          <strong>Skip the first row of labels on the first page:</strong><br />
          <pre className="bg-light p-2 border rounded">1: A1-E1</pre>
        </li>
        <li className="mb-2">
          <strong>Skip specific labels on the second page:</strong><br />
          <pre className="bg-light p-2 border rounded">2: B3, D11, A17</pre>
        </li>
        <li className="mb-2">
          <strong>Skip all the labels mentioned above:</strong>
          <pre className="bg-light p-2 border rounded">
            1: A1-E1<br />
            2: B3, D11, A17
          </pre>
        </li>
      </ul>
      <p>
        Each page of skipped labels should be listed on a separate line.
      </p>

      <h4 className="mt-4">Add Aliquots</h4>
      <p>
        <strong>Add Aliquots</strong> generates labels that append
        <em>"1 of n"</em> to the end of the label text, 
        where <em>n</em> represents the number of replicates of that aliquot.
      </p>

      <h4 className="mt-4">Calculate Aliquots</h4>
      <p>
        If you have a material with a known concentration and volume and need to 
        create aliquots of specific masses
        (e.g., 50 mg, 100 mg, 200 mg), enter the concentration and 
        total volume, then specify the desired aliquot amounts (in any order)
        in the <strong>Aliquot Amounts</strong> input field (e.g., <code>[200, 50, 100]</code>).
        You can add commas between amounts or leave them out like this: <code>[50 100 200]</code>.
      </p>
      <p>
        The volumes for each aliquot will be calculated and labels generated accordingly.
      </p>

    </Container>
  );
}

export default AboutPage;

