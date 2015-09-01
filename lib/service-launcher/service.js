import * as _ from 'lodash';
import {push, pull} from '../connection';
import {response, rpc} from '../connection/rpc';
import {SINGLETYPE, MULTITYPE} from './service-types';

export default class Service{

  constructor(process){

    this.process = process;

    this.service = require(process.argv[2]);

    this.input = pull();
    this.output = push();

    this.type = _.isFunction(this.service)? SINGLETYPE : MULTITYPE;
    this.methods = Object.keys(this.service);

    // calling the the service
    response(this.input, this.output, 'data')((data, callback) =>{

      process.send({type:'call', data: process.pid});

      rpc(this.service)(data, callback)
    });

    // calls to this
    response(process)(rpc(this));

    process.send({type:'ready', data: this.getDefinition()});
  }

  call(args){

    return this.service.apply(this.service, args)
  }

  bind(host, inputPort, outputPort){

    this.input.connect(`tcp://${host}:${inputPort}`);
    this.output.connect(`tcp://${host}:${outputPort}`);
  }

  getDefinition(){

    return {

      type: this.type,
      methods: Object.keys(this.service)
    }
  }
}