

var connection = require('../connection');
var _          = require('lodash');

var service = require(process.argv[2]);
var conn = connection.create();

if (_.isFunction(service)) {

  initSingleMethod(service);
}

process.send(conn);

// single method process
function initSingleMethod(service) {

  conn.input.on('data', function (args) {

    conn.output.sendData(service.apply(service, args));
  })
}



