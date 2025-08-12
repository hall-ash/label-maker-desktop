## About

Columns are indexed by letters, and rows are indexed by numbers. The first label coordinate is **A1**; the last label coordinate on a sheet with 5 columns and 17 rows is **E17**.

You can adjust font size, text alignment, etc. by clicking the gear icon. Label text is automatically resized to fit the label dimensions.

### Start on Label

You can start printing at a specific label coordinate. For example, entering **B2** in the **Start On Label** input field will print labels starting on column 2, row 2 of the sheet. Leaving it blank will start printing on the first label coordinate (**A1**).

### Skipping Labels

You can prevent printing on specific label coordinates by adding them to the **Skip Labels** input field.

#### Examples

- **Skip the first row of labels on the first page:**
  ```
  1: A1-E1
  ```

- **Skip specific labels on the second page:**
  ```
  2: B3, D11, A17
  ```

- **Skip all the labels mentioned above:**
  ```
  1: A1-E1
  2: B3, D11, A17
  ```

Each page of skipped labels should be listed on a separate line.

### Add Aliquots

**Add Aliquots** generates labels that append *"1 of n"* to the end of the label text, where *n* represents the number of replicates of that aliquot.

### Calculate Aliquots

If you have a material with a known concentration and volume and need to create aliquots of specific masses (e.g., 50 mg, 100 mg, 200 mg), enter the concentration and total volume, then specify the desired aliquot amounts (in any order) in the **Aliquot Amounts** input field:

```
[200, 50, 100]
```
or
```
[50 100 200]
```

The volumes for each aliquot will be calculated, and labels will be generated accordingly.