import * as _ from 'lodash';
import {push, pull} from '../connection';
import {response, rpc} from '../connection/rpc';

const SINGLETYPE = 'single-method';
const MULTIETYPE = 'multi-method';

export default class Service{

  constructor(process){

    this.process = process;

    this.service = require(process.argv[2]);

    this.input = pull();
    this.output = push();

    this.type = _.isFunction(this.service)? SINGLETYPE : MULTIETYPE;

    // calling the the service
    response(this.input, this.output, 'data')(rpc(this.service));

    // calls to this
    response(process)(rpc(this));

    process.send({type:'ready', data: this.getDefinition()});
  }

  reply(request, callback){

    callback(null, this.call(request))
  }

  call(args){

    return this.service.apply(this.service, args)
  }

  bind(host, inputPort, outputPort){

    this.input.bindSync(`tcp://${host}:${inputPort}`);
    this.output.connect(`tcp://${host}:${outputPort}`);
  }

  getDefinition(){

    return {

      type: this.type,
      methods: Object.keys(this.service)
    }
  }
}