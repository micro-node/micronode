
var fork = require('child_process').fork;
var os   = require('os');


module.exports.fork = _fork;


function _fork(path, n){

  // set number of forks to one as default
  if(n === undefined) n = 1;

  // zero equals max
  if(n === 0) n = os.cpus().length;

}