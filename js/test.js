var v = -100;
console.log((v>>>2))
console.log((v>>2))
const fs = require('fs');
let rawdata = fs.readFileSync('../protol/answer.json');
let fdata = JSON.parse(rawdata);
console.log(fdata.sdp)