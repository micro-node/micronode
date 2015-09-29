require("babel/register");

var amqp = require('../../../lib/connection/amqp');

var server = amqp.server('localhost', require('../fibonacci/fast'));

process.on('exit', server.close);