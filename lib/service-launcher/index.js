/**
 * NodeJS service launcher
 *
 */
var cp         = require('child_process');

module.exports.launch = launch;
module.exports.launchPath = launchPath;

function launchPath(path, cb){

  var worker = cp.fork(__dirname+'/worker.js', [path]);

  worker.on('message', cb);

  process.on("exit", function () {

    worker.kill();
  });
}


function launch(name){


}