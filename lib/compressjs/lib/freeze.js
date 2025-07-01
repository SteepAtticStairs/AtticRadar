// if (typeof define !== 'function') { var define = require('amdefine')(module); }
// define([],function(){
  // 'use strict';

  // Object.freeze(), or a thunk if that method is not present in this
  // JavaScript environment.

  if (Object.freeze) {
    // return Object.freeze;
    module.exports = Object.freeze;
  } else {
    // return function(o) { return o; };
    module.exports = function(o) { return o; };
  }

// });
