require("babel/register");

var assert = require('assert');
var path = require('path');
var launcher = require('../lib/service-launcher');
var Client = require('../lib/client');

describe('Service Launcher', function() {

  describe('Launch Service', function () {

    it('should launch a path', function (done) {

      launcher.launchPath(path.join(__dirname, '/services/fibonacci'), function(err, service){

        if(err) done(err);

        console.log('workers', service.workers.map(function(w){ return w.process.pid}));

        service.bind('127.0.0.1', 5001, 5002);

        var client = Client.create(service);

        client([60], function(err, result){

          if(err) done(err);

          assert.equal(result, 1548008755920);
        });

        client([47], function(err, result){

          if(err) done(err);

          assert.equal(result, 2971215073);
          done();
        });

      });


    });
  });
});