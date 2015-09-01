import {fork} from 'child_process';
import {cpus} from 'os';
import {range} from 'lodash';
import {parallel} from 'async';
import {request} from '../connection/rpc';

export default class ServiceManager{

  constructor(path, callback){

    this.path = path;

    this.workers = [];

    parallel(range(cpus().length).map(()=> this.fork.bind(this)), (err, res) => callback(err, res.pop()));

    process.on("exit", ()=> this.workers.forEach(w => w.process.kill()))
  }

  fork(callback){

    let process = fork(__dirname+'/worker.js', [this.path]);
    let client = request(process);

    process.on('error', callback);
    process.on('message', ({type, data})=>{

      if(type === 'ready'){

        this.definition = data;
        callback(null, this);
      }

      if(type === 'call'){

        console.log('call', data);
      }
    });

    this.workers.push({process, client})
  }

  bind(host, inputPort, outputPort, callback){

    this.host = host;
    this.inputPort = inputPort;
    this.outputPort = outputPort;

    parallel(this.workers.map(w => w.client.bind(w, ['bind', [host, inputPort, outputPort]])), callback);
  }

  stop(){

  }

  start(){

  }

  update(){

  }

  kill(){

  }
}