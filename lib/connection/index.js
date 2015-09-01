
import {socket} from 'zmq';

let connections = {};

export function pull(){

  return extendSocket(socket('pull'));
}

export function push(){

  return extendSocket(socket('push'))
}

export function getSafePort(addr){

  var connection = connections[addr];

  if(!connection)
    return 3000;

  return connection.sort()[connection.length - 1] + 1;
}

export function register(addr){

  var ports = Array.prototype.slice.call(arguments, 1);

  if(!connections[addr])
    connections[addr] = [];

  connections[addr].concat(ports);
}


function extendSocket(sock){

  //monitor(sock);

  if(sock.type === 'push'){

    let oldSend = sock.send;

    sock.send = function(data){

      oldSend.call(sock, JSON.stringify(data));
    };
  }

  sock.on('message', function(buffer) {

    if (buffer) {

      try {

        sock.emit('data', JSON.parse(buffer.toString()))

      } catch (e) {

        sock.emit('error', e)
      }
    }
  });

  return sock;
}


function monitor(sock){

  // Register to monitoring events
  sock.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
  sock.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
  sock.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
  sock.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
  sock.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
  sock.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
  sock.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
  sock.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
  sock.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
  sock.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

  sock.monitor();
}

