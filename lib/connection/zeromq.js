
import {socket} from 'zmq';

const socketTypes = ['pull', 'push', 'dealer', 'router', 'req', 'rep'];

/**
 * extend every usefull type
 */
socketTypes.forEach(function(type){

  module.exports[type] = function(){

    return extendSocket(socket(type));
  }
});

/**
 * extend socket with data methods
 * @param sock
 * @returns {*}
 */
function extendSocket(sock){

  if(sock.type === 'push' || sock.type === 'router' || sock.type === 'dealer'){

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


  process.on('SIGINT', function() {
    sock.close();
  });

  process.on('exit', function() {
    sock.close();
  });

  return sock;
}

/**
 * monitor helper
 * @param sock
 */
export function monitor(sock){

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

