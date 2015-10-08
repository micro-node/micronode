require("babel/register");

var assert = require('assert');
var expect = require('chai').expect;
var async = require('async');

var rpc = require('../lib/rpc');
var parameterNames = rpc.parameterNames;
var methodsDefinition = rpc.methodsDefinition;
var response = rpc.response;


describe('RPC', function(){

  describe('extract function parameters names', function(){

    it('should extract function param names', function(){

      assert.deepEqual(parameterNames(function(a, b, c, d){}), ['a', 'b', 'c', 'd'])
    });

    it('should ignore comments', function(){

      assert.deepEqual(parameterNames(function(a,/* comment */ b, c, d){}), ['a', 'b', 'c', 'd'])
    })
  });

  describe('Methods defintion', function(){

    var multimethod = {

      procedure1: function(a,b, callback){},
      procedure2: function(callback){}
    };

    it('should return definition for Multimethod services', function(){

      var def = methodsDefinition(multimethod);

      expect(def).to.have.property('type').that.is.equal('multi-method');
      expect(def).to.have.property('methods');
      expect(def.methods).to.deep.equal({'procedure1': {name: 'procedure1', params: ['a', 'b', 'callback']}, 'procedure2' : {name: 'procedure2', params: ['callback']}})

    });

    it('should return definition for Singlemethod service', function(){

      var def = methodsDefinition(multimethod.procedure1);

      expect(def).to.have.property('type').that.is.equal('single-method');
      expect(def).to.have.property('methods');
      expect(def.methods).to.deep.equal({default: {name: 'default', params: ['a', 'b', 'callback']}})
    })

  });


  describe('Response function', function(){


    it('should create the right response for array params', function(done){

      var multimethod = {

        add: function(a, b, callback){

          return callback(null, a + b);
        }
      };

      var req = {

        method: 'add',
        params: [1, 1],
        jsonrpc: '2.0',
        id: 1
      };

      response(multimethod)(req, function(err, resp){

        expect(resp).to.equal(2);
        done(err);
      });
    });

    it('should create the right response for object params', function(done){

      var multimethod = {

        add: function(a, b, callback){

          return callback(null, a + b);
        }
      };

      var req = {

        jsonrpc: '2.0',
        method: 'add',
        id: 1,
        params: {
          a: 1,
          b: 2
        }
      };

      response(multimethod)(req, function(err, resp){

        expect(resp).to.equal(3);
        done(err);
      });
    });

    it('should create reply with an invalid request', function(done) {


      response(function(){})({}, function(err, resp){

        expect(resp.error.code).to.equal(-32600);
        done();
      });

    })
  })
});