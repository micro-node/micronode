
import * as uuid from 'node-uuid';
import * as _ from 'lodash';

const REQUESTTYPE = 'request';
const RESPONSETYPE = 'response';
const EVENT = 'message';

let callbacks = {};

export function request(inputChannel, outputChannel = inputChannel, event = EVENT){

  inputChannel.on(event, function({id, err, data}){

    let callback = callbacks[id];

    if(callback){

      callback(err, data);

      delete callbacks[id];
    }
  });

  return function(data, callback){

    let id = uuid.v4();

    callbacks[id] = callback;

    outputChannel.send({type: REQUESTTYPE, id, data})
  }
}


export function response(inputChannel, outputChannel = inputChannel, event = EVENT){

  return function(handler){

    inputChannel.on(event, function({type, id, data}){

      if(type !== REQUESTTYPE) return;

      handler(data, function(err, data){

        outputChannel.send({type: RESPONSETYPE, id, err, data})
      })
    })
  }
}


export function rpc(obj){

  if(_.isFunction(obj))
    return singleMethod;

  return multiMethod;

  // simple services are single methods
  function singleMethod(args, callback){

    try{

      callback(null, obj.apply(obj, args));

    }catch(err){

      callback(err);
    }
  }

  // complex service have methods and properties
  function multiMethod([name, args], callback){

    let method, result;

    if(Object.keys(obj).indexOf(name) > -1 || obj[name] !== undefined){

      method = obj[name]

    }else{

      callback(new Error('method or property not found!!!'))
    }

    try{

      if(_.isFunction(method)){

        result = method.apply(obj, args)

      } else{

        result = method;
      }

    }catch(err){

      callback(err);
    }

    callback(null, result)
  }
}
