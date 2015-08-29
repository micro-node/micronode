
var assert = require('assert');
var path = require('path');
var launcher = require('../lib/service-launcher');
var connection = require('../lib/connection');

describe('Service Launcher', function() {

  describe('Launch Service', function () {

    it('should launch a path', function (done) {

      launcher.launchPath(path.join(__dirname, '/services/fibonacci'), function(service){

        var client = connection.createClient(service);

        client([6], function(result){

          assert.equal(result, 8);
          done();
        });

      });


    });
  });
});