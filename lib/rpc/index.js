import * as _ from 'lodash';

// types
export const SINGLETYPE = 'single-method';
export const MULTITYPE = 'multi-method';

// some cool regexp
const FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

//RPC version
const JSONRPCVERSION = '2.0'

// errors
const INVALIDREQUEST = -32600;

export function parameterNames(fn){

  let params = [];

  let fnText = fn.toString().replace(STRIP_COMMENTS, '');
  let argDecl = fnText.match(FN_ARGS);
  let args = argDecl[1].split(FN_ARG_SPLIT);

  args.forEach(arg => arg.replace(FN_ARG, (all, underscore, name) => params.push(name)));

  return params;
}


export function methodsDefinition(service){

  let isSingleMethod = _.isFunction(service);

  let type = isSingleMethod? SINGLETYPE: MULTITYPE;
  let methods = {};

  if(isSingleMethod){

    methods.default = { name: 'default', params: parameterNames(service) }

  }else{

    Object.keys(service).forEach( name => methods[name] = {name, params: parameterNames(service[name])})
  }

  return {type, methods}
}


export function response(methods){

  var def = methodsDefinition(methods);

  return (def.type === SINGLETYPE)? check(single) : check(multi);


  function single(req, callback){

    methods.apply(methods, params(req).concat(callback))
  }


  function multi(req, callback){

    methods[req.method].apply(methods[req.method], params(req).concat(callback))
  }

  function params({params, method}){

    if(_.isArray(params))
      return params;

    if(_.isObject(params)){

      return def.methods[method].params
        .map(name => params[name])
        .filter(param => param !== undefined)
    }
  }

  function check(fn){

    return function(req, callback){

      let err = error(def, req);

      if(!err)
        return fn(req, callback);

      callback(err, {
        jsonrpc: JSONRPCVERSION,
        error: err,
        id: req.id
      })
    }
  }
}


export function error(def, req){

  return invalidRequest(req);

  function invalidRequest(req){

    if(req.jsonrpc !== JSONRPCVERSION){

      return {
        code: INVALIDREQUEST,
        message: 'The JSONRPC version doesn\'t match 2.0'
      }
    }

    if(req.id === undefined){

      return {
        code: INVALIDREQUEST,
        message: 'The id member is missing'
      }
    }
  }
}