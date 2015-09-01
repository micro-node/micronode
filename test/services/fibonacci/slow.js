module.exports = fibonacci;

function fibonacci(n, callback){

  return callback(null, function fib(n){

    if(n === 0) return 0;

    return n > 1 ? fib(n - 1) + fib(n - 2) : 1;
  }(n));
}