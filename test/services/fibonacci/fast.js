module.exports = fibonacci;

function fibonacci(n, callback){

  // avoid stack overflow with tail recursion
  return function fib(n, a, b) {

   return n > 0 ? fib(n-1, b, a + b) : callback(null, a);
   }(n,0,1);
}