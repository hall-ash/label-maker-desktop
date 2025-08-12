import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 5 });

const makeAliquot = () => ({ 
    id: uid.rnd(), 
    aliquottext: '', 
    number: '1' 
});

const makeLabel = () => ({
    id: uid.rnd(),
    labeltext: '',
    displayAliquots: false,
    labelcount: '1',
    aliquots: Array.from({ length: 1 }, makeAliquot),
});

export { makeLabel, makeAliquot };

