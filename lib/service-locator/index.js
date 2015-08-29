


var services = {};


module.exports.register = register;



function register(name, config){

  services[name] = config;

}