
var zmq = require('zmq');
var socket = zmq.socket;

var connections = {};

module.exports.socket = socket;
module.exports.pull = pull;
module.exports.push = push;
module.exports.create = create;
module.exports.createClient = createClient;


function pull(){

  return extendSocket(socket('pull'));
}

function push(){

  return extendSocket(socket('push'))
}

function create(addr, pullPort, pushPort){

  if(!addr) addr = 'tcp://127.0.0.1';

  if(!pullPort){

    pullPort = getSafePort(addr);
    pushPort = pullPort + 1;
  }

  var input = pull();
  var output = push();

  var inputEndpoint = addr + ':' + pullPort;
  var outputEndpoint = addr + ':' + pushPort;

  input.bindSync(inputEndpoint);
  output.connect(outputEndpoint);

  input.port = pullPort;
  input.endpint = inputEndpoint;

  output.port = pushPort;
  output.endpint = outputEndpoint;

  register(addr, pullPort, pushPort);

  return {
    addr: addr,
    input: input,
    output: output
  }
}

function getSafePort(addr){

  var connection = connections[addr];

  if(!connection)
    return 3000;

  return connection.sort()[connection.length - 1] + 2;
}

function register(addr){

  var ports = Array.prototype.slice.call(arguments, 1);

  if(!connections[addr])
    connections[addr] = [];

  connections[addr].concat(ports);
}


function extendSocket(sock){

  monitor(sock);

  if(sock.type === 'push'){

    sock.sendData = function(data){

      console.log('send', data);

      sock.send(JSON.stringify(data));
    };
  }

  sock.on('message', function(buffer) {

    console.log('buffer', buffer.toString());

    if (buffer) {

      try {

        sock.emit('data', JSON.parse(buffer.toString()))

      } catch (e) {

        console.log(e);

        sock.emit('error', new Error('JSON parse failed'))
      }
    }
  });


  return sock;
}


function createClient(service){

  var clientConn = create(service.addr, service.output.port, service.input.port);

  return function(args, callback){

    clientConn.input.once('data', function(data){

      callback(data);
    });

    clientConn.output.sendData(args);
  }

}

var index = 0;

function monitor(sock){

  (function(index){

    // Register to monitoring events
    sock.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep, index);});
    sock.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep, index);});
    sock.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep, index);});
    sock.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep, index);});
    sock.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep, index);});
    sock.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep, index);});
    sock.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep, index);});
    sock.on('close', function(fd, ep) {console.log('close, endpoint:', ep, index);});
    sock.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep, index);});
    sock.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep, index);});

    sock.monitor();

  })(index++)
}

