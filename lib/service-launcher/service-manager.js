import * as cp from 'child_process';
import {request} from '../connection/rpc';

export default class ServiceManager{

  constructor(path, callback){

    this.callback = callback;

    this.worker = cp.fork(__dirname+'/worker.js', [path]);

    this.workerClient = request(this.worker);

    this.worker.on('error', callback);
    this.worker.on('message', this.onMessage.bind(this));

    process.on("exit", ()=> this.worker.kill())
  }

  onMessage({type, data}){

    if(type === 'ready'){

      this.init(data);
    }
  }

  init(def){

    this.definition = def;
    this.callback(null, this);
  }

  call(args, callback){

    this.workerClient(['call', args], callback)
  }

  bind(host, inputPort, outputPort, callback){

    this.host = host;
    this.inputPort = inputPort;
    this.outputPort = outputPort;

    this.workerClient(['bind', [host, inputPort, outputPort]], callback)
  }

  stop(){

  }

  start(){

  }

  update(){

  }

  fork(){

  }

  kill(){

  }
}