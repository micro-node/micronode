
import {push, pull} from '../connection';
import {request} from '../connection/rpc';

export function create(service){

  let {host, inputPort, outputPort} = service;

  let inputSocket = pull();
  let outputSocket = push();

  inputSocket.bindSync(`tcp://${host}:${outputPort}`);
  outputSocket.connect(`tcp://${host}:${inputPort}`);

  let client = request(inputSocket, outputSocket, 'data');

  client.inputSocket = inputSocket;
  client.outputSocket = outputSocket;

  return client;
}