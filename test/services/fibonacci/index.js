
module.exports = fibonacci;

function fibonacci(n){

  // avoid stack overflow with tail recursion
  return function fib(n, a, b) {

    return n > 0 ? fib(n-1, b, a + b) : a;
  }(n,0,1);
}


