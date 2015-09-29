import {push, pull} from '../connection/zeromq';
import {request} from '../connection/rpc';
import {SINGLETYPE, MULTITYPE} from '../service-launcher/service-types';

export function create(service){

  let {host, inputPort, outputPort, definition} = service;

  let inputSocket = pull();
  let outputSocket = push();

  inputSocket.bindSync(`tcp://${host}:${outputPort}`);
  outputSocket.bindSync(`tcp://${host}:${inputPort}`);

  let client = request(inputSocket, outputSocket, 'data');


  if(definition.type === SINGLETYPE){

    return function(...args){

      let callback = args.pop();

      client(args, callback);
    };
  }

  let multiclient = {};

  definition.methods.forEach(function(m){

    multiclient[m] = function(...args){

      let callback = args.pop();

      client([m, args], callback);
    }
  });

  return multiclient;

}