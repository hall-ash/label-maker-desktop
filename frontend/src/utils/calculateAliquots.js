const calculateAliquots = (concentration, volume, amounts, aliquotMassUnit="mg") => {


    amounts.sort((a, b) => a - b);
    const totalMass = concentration * volume;
    const totalSum = amounts.reduce((a, b) => a + b, 0);
    const factor = Math.floor(totalMass / totalSum);
    let remaining_mgs = totalMass % totalSum;

    const aliquots = [];
    const frequency = Array(amounts.length).fill(factor);

    // loop through the array in reverse (favors larger )
    let i = amounts.length - 1;
    while (remaining_mgs >= amounts[0]) {
      
      if (remaining_mgs >= amounts[i]) {
        frequency[i] += 1;
        remaining_mgs -= amounts[i];
      }

      i = (i - 1 + amounts.length) % amounts.length;
  
    }


    const doRounding = (num) => num > 1 ? Math.round(num * 10) / 10 : Math.round(num * 1000) / 1000;
    const doFormatting = (num) => num > 1 ? num.toFixed(1) : (num * 1000).toFixed(0);

    for (let i = 0; i < amounts.length; i++) {
      const mass = amounts[i];
      const roundedVol = doRounding(mass / concentration);

      const volume = doFormatting(roundedVol);
      const volumeUnit = roundedVol > 1 ? 'mL' : 'µL';
      const number = frequency[i];

      aliquots.push({
        aliquottext: `${mass}${aliquotMassUnit}, ${volume}${volumeUnit}`,
        number,
      })
    }

    if (remaining_mgs > 0) {
      const rounded_remaining_mgs = doRounding(remaining_mgs);
      const remaining_mgs_mass_unit = rounded_remaining_mgs > 1 ? 'mg' : 'µg';
      const roundedVol = doRounding(remaining_mgs / concentration);
      const remVolumeUnit = roundedVol > 1 ? 'mL' : 'µL';
      aliquots.push({
        aliquottext: `${rounded_remaining_mgs}${remaining_mgs_mass_unit}, ${doFormatting(roundedVol)}${remVolumeUnit}`,
        number: 1,
      });
    }

    return aliquots.filter(aliquot => aliquot.number > 0);
  };



export default calculateAliquots;