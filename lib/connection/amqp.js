import * as amqp from 'amqplib';
import * as uuid from 'node-uuid';

const protocol = 'amqp';
const contentType = 'application/json';
const rpcQueue = 'rpc_queue';

export function client(addr){

  let Q = assetQueue(addr, '', {exclusive: true});

  return function(req, callback){

    Q.then(function([ch, q]){

      let correlationId = uuid.v4();
      let replyTo = q.queue;

      ch.consume(replyTo, function(msg) {

        if(msg.properties.correlationId == correlationId)
          callback(null, JSON.parse(msg.content.toString()));

      }, {noAck: true});

      ch.sendToQueue(rpcQueue, new Buffer(JSON.stringify(req)), {correlationId, replyTo, contentType});

    }).then(null, callback);
  }
}

export function server(addr, func){

  var connection = createChannel(addr).then(function([conn, ch]){

    ch.assertQueue(rpcQueue, {durable: false});
    ch.prefetch(1);

    ch.consume(rpcQueue, function reply(msg) {

      let req = JSON.parse(msg.content.toString());

      func(req, function(err, resp){

        ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(resp)), {correlationId: msg.properties.correlationId, contentType});
        ch.ack(msg);
      });
    });

    return conn;
  });

  return {

    close: function(){

      connection.then(conn => conn.close())
    }
  }
}

function assetQueue(addr, queue, options){

  return createChannel(addr)
    .then(([conn, ch])=> ch.assertQueue(queue, options).then(q => [ch, q]));
}

function createChannel(addr){

  return amqp.connect(genAddr(addr))
    .then((conn) => conn.createChannel()
      .then(ch => [conn, ch]
    ), console.warn);
}

function genAddr(addr, proc = protocol){

  return `${proc}://${addr}`;
}