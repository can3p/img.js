(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.img = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = img;

var _utils = require("./utils");

var load_image = _utils.load_image;
var create_image_data = _utils.create_image_data;
var clone_image_data = _utils.clone_image_data;
var multiply_matrix = _utils.multiply_matrix;
var add_matrix = _utils.add_matrix;

function img(src) {
  return unit(src);
}

var proto = {};

function unit(src) {
  var promise = src instanceof Promise ? src : load_image(src);

  promise["catch"](function (e) {
    console.log("load promise failed", e);
  });

  var monad = Object.create(proto);

  monad.bind = function (func) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return unit(promise.then(function (img) {
      //var t1 = performance.now();
      var res = func.apply(undefined, [img].concat(args));
      //var t2 = performance.now();
      //console.log('timing is ', t2-t1, func.toString().match(/^function\s(\w+)/)[1]);

      return res;
    }));
  };

  return monad;
}

function lift(name, func) {
  proto[name] = function () {
    var _ref;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (_ref = this).bind.apply(_ref, [func].concat(args));
  };
}

lift("outputTo", function outputTo(data, el) {
  var c = document.createElement("canvas");
  c.width = data.width;c.height = data.height;

  var ctx = c.getContext("2d");
  ctx.putImageData(data, 0, 0);

  el.innerHTML = "";
  el.appendChild(c);
});

lift("identity", function (data) {
  var new_data = create_image_data(data.width, data.height);
  var cur_pos, new_pos;

  for (var x = 0; x < data.width; ++x) {
    for (var y = 0; y < data.height; ++y) {
      cur_pos = (y * data.width + x) * 4;
      new_pos = (y * data.width + x) * 4;

      new_data.data[new_pos] = data.data[cur_pos];
      new_data.data[new_pos + 1] = data.data[cur_pos + 1];
      new_data.data[new_pos + 2] = data.data[cur_pos + 2];
      new_data.data[new_pos + 3] = data.data[cur_pos + 3];
    }
  }

  return new_data;
});

lift("identity2", function (data) {
  var new_data = clone_image_data(data);

  return multiply_matrix(new_data, [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
});

lift("flipY", function (data) {
  var new_data = create_image_data(data.width, data.height);
  var cur_pos, new_pos;

  for (var x = 0; x < data.width; ++x) {
    for (var y = 0; y < data.height; ++y) {
      cur_pos = (y * data.width + x) * 4;
      new_pos = ((data.height - y - 1) * data.width + x) * 4;

      new_data.data[new_pos] = data.data[cur_pos];
      new_data.data[new_pos + 1] = data.data[cur_pos + 1];
      new_data.data[new_pos + 2] = data.data[cur_pos + 2];
      new_data.data[new_pos + 3] = data.data[cur_pos + 3];
    }
  }

  return new_data;
});

lift("flipX", function (data) {
  var new_data = create_image_data(data.width, data.height);
  var cur_pos, new_pos;

  for (var x = 0; x < data.width; ++x) {
    for (var y = 0; y < data.height; ++y) {
      cur_pos = (y * data.width + x) * 4;
      new_pos = (y * data.width + (data.width - x - 1)) * 4;

      new_data.data[new_pos] = data.data[cur_pos];
      new_data.data[new_pos + 1] = data.data[cur_pos + 1];
      new_data.data[new_pos + 2] = data.data[cur_pos + 2];
      new_data.data[new_pos + 3] = data.data[cur_pos + 3];
    }
  }

  return new_data;
});

lift("inverse", function (data) {
  var new_data = create_image_data(data.width, data.height);
  var cur_pos, new_pos;

  for (var x = 0; x < data.width; ++x) {
    for (var y = 0; y < data.height; ++y) {
      cur_pos = (y * data.width + x) * 4;
      new_pos = (y * data.width + x) * 4;

      new_data.data[new_pos] = 255 - data.data[cur_pos];
      new_data.data[new_pos + 1] = 255 - data.data[cur_pos + 1];
      new_data.data[new_pos + 2] = 255 - data.data[cur_pos + 2];
      new_data.data[new_pos + 3] = data.data[cur_pos + 3];
    }
  }

  return new_data;
});

lift("grayscale", function grayscale2(data) {
  var new_data = clone_image_data(data);

  return multiply_matrix(new_data, [[0.21, 0.72, 0.07, 0], [0.21, 0.72, 0.07, 0], [0.21, 0.72, 0.07, 0], [0, 0, 0, 1]]);
});

// http://content.gpwiki.org/D3DBook:Useful_Effect_Snippets
lift("sepia", function sepia(data) {
  var tone = arguments[1] === undefined ? 40 : arguments[1];

  var new_data = clone_image_data(data);

  multiply_matrix(new_data, [[0.299, 0.587, 0.114, 0], //Y
  [0, 0, 0, 0], //I, not used <] [0.596,-0.275,-0.321, 0],
  [0, 0, 0, 0], //Q, not used <] [0.212,-0.523, 0.311, 0],
  [0, 0, 0, 1]]);

  add_matrix(new_data, [0, tone, 0, 0]);

  multiply_matrix(new_data, [[1, 0.956, 0.62, 0], [1, -0.272, -0.647, 0], [1, -1.108, 1.705, 0], [0, 0, 0, 1]]);

  return new_data;
});

},{"./utils":2}],2:[function(require,module,exports){
"use strict";

exports.load_image = load_image;
exports.create_image_data = create_image_data;
exports.clone_image_data = clone_image_data;

/* will modify data inplace */
exports.multiply_matrix = multiply_matrix;

/* will modify data inplace */
exports.add_matrix = add_matrix;
Object.defineProperty(exports, "__esModule", {
  value: true
});
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

function load_image(src) {
  if (src instanceof Image) {
    return new Promise(function (accept) {
      accept(src);
    });
  }

  return new Promise(function (accept, reject) {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = img.width;c.height = img.height;

      var ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);

      var image_data = ctx.getImageData(0, 0, c.width, c.height);

      accept(image_data);
      img = null;
    };

    img.onerror = function (err) {
      reject(err);
      img = null;
    };

    img.src = src;
  });
}

function create_image_data(width, height) {
  var c = document.createElement("canvas");

  return c.getContext("2d").createImageData(width, height);
}

function clone_image_data(data) {
  var c = document.createElement("canvas");
  var ctx = c.getContext("2d");

  var width = data.width;
  var height = data.height;

  c.width = width;c.height = height;

  ctx.putImageData(data, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

function multiply_matrix(data, matrix) {
  if (matrix.length !== 4 || matrix.filter(function (el) {
    return el.length !== 4;
  }).length > 0) throw new Error("filter matrix can be only 4 by 4");

  var max = data.width * data.height;

  var buf = new ArrayBuffer(data.data.length);
  var buf8 = new Uint8ClampedArray(buf);
  var buf32 = new Uint32Array(buf);

  for (var pos = 0; pos < max; ++pos) {
    var real_pos = pos * 4;

    buf32[pos] = clamp(data.data[real_pos] * matrix[3][0] + data.data[real_pos + 1] * matrix[3][1] + data.data[real_pos + 2] * matrix[3][2] + data.data[real_pos + 3] * matrix[3][3], 0, 255) << 24 | clamp(data.data[real_pos] * matrix[2][0] + data.data[real_pos + 1] * matrix[2][1] + data.data[real_pos + 2] * matrix[2][2] + data.data[real_pos + 3] * matrix[2][3], 0, 255) << 16 | clamp(data.data[real_pos] * matrix[1][0] + data.data[real_pos + 1] * matrix[1][1] + data.data[real_pos + 2] * matrix[1][2] + data.data[real_pos + 3] * matrix[1][3], 0, 255) << 8 | clamp(data.data[real_pos] * matrix[0][0] + data.data[real_pos + 1] * matrix[0][1] + data.data[real_pos + 2] * matrix[0][2] + data.data[real_pos + 3] * matrix[0][3], 0, 255);
  }

  data.data.set(buf8);

  return data;
}

function add_matrix(data, matrix) {
  if (matrix.length !== 4) throw new Error("filter matrix can be only 4 by 4");

  var max = data.width * data.height;

  for (var pos = 0; pos < max; ++pos) {
    var real_pos = pos * 4;

    data.data[real_pos + 0] += matrix[0];
    data.data[real_pos + 1] += matrix[1];
    data.data[real_pos + 2] += matrix[2];
    data.data[real_pos + 3] += matrix[3];
  }

  return data;
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZHBldHJvdi9jb2RlL2pzL2ltZy5qcy9saWIvaW1nLmpzIiwiL1VzZXJzL2RwZXRyb3YvY29kZS9qcy9pbWcuanMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7aUJDSXdCLEdBQUc7O3FCQUZnRSxTQUFTOztJQUE1RixVQUFVLFVBQVYsVUFBVTtJQUFFLGlCQUFpQixVQUFqQixpQkFBaUI7SUFBRSxnQkFBZ0IsVUFBaEIsZ0JBQWdCO0lBQUUsZUFBZSxVQUFmLGVBQWU7SUFBRSxVQUFVLFVBQVYsVUFBVTs7QUFFckUsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFO0FBQy9CLFNBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2xCOztBQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakIsTUFBSSxPQUFPLEdBQUcsR0FBRyxZQUFZLE9BQU8sR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUU3RCxTQUFPLFNBQU0sQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUN4QixXQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsQ0FBQzs7QUFFSCxNQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqQyxPQUFLLENBQUMsSUFBSSxHQUFHLFVBQVMsSUFBSSxFQUFXO3NDQUFOLElBQUk7QUFBSixVQUFJOzs7QUFDakMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTs7QUFFckMsVUFBSSxHQUFHLEdBQUcsSUFBSSxtQkFBQyxHQUFHLFNBQUssSUFBSSxFQUFDLENBQUM7Ozs7QUFJN0IsYUFBTyxHQUFHLENBQUM7S0FDWixDQUFDLENBQUMsQ0FBQztHQUNMLENBQUM7O0FBRUYsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3hCLE9BQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFrQjs7O3NDQUFOLElBQUk7QUFBSixVQUFJOzs7QUFDNUIsV0FBTyxRQUFBLElBQUksRUFBQyxJQUFJLE1BQUEsUUFBQyxJQUFJLFNBQUssSUFBSSxFQUFDLENBQUM7R0FDakMsQ0FBQztDQUNIOztBQUVELElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUMzQyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLEdBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFN0MsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixLQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRTdCLElBQUUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLElBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkIsQ0FBQyxDQUFDOztBQUVILElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDOUIsTUFBSSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsTUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDOztBQUVyQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNuQyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNwQyxhQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDbkMsYUFBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFDOztBQUVuQyxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEQsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEQsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDckQ7R0FDRjs7QUFFRCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDLENBQUM7O0FBRUgsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFTLElBQUksRUFBRTtBQUMvQixNQUFJLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdEMsU0FBTyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7Q0FDcEQsQ0FBQyxDQUFDOztBQUVILElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDM0IsTUFBSSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsTUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDOztBQUVyQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNuQyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNwQyxhQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDbkMsYUFBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQzs7QUFFdkQsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BELGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BELGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0dBQ0Y7O0FBRUQsU0FBTyxRQUFRLENBQUM7Q0FDakIsQ0FBQyxDQUFDOztBQUVILElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDM0IsTUFBSSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsTUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDOztBQUVyQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNuQyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNwQyxhQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDbkMsYUFBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsR0FBSSxDQUFDLENBQUM7O0FBRXRELGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwRCxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwRCxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNyRDtHQUNGOztBQUVELFNBQU8sUUFBUSxDQUFDO0NBQ2pCLENBQUMsQ0FBQzs7QUFFSCxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVMsSUFBSSxFQUFFO0FBQzdCLE1BQUksUUFBUSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFELE1BQUksT0FBTyxFQUFFLE9BQU8sQ0FBQzs7QUFFckIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDbkMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDcEMsYUFBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFDO0FBQ25DLGFBQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQzs7QUFFbkMsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsY0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFELGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0dBQ0Y7O0FBRUQsU0FBTyxRQUFRLENBQUM7Q0FDakIsQ0FBQyxDQUFDOztBQUVILElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQzFDLE1BQUksUUFBUSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV0QyxTQUFPLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNyQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNyQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNyQixDQUFDLENBQUMsRUFBSyxDQUFDLEVBQUssQ0FBQyxFQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQztDQUM3RCxDQUFDLENBQUM7OztBQUdILElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFhO01BQVgsSUFBSSxnQ0FBRyxFQUFFOztBQUMxQyxNQUFJLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdEMsaUJBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN4QixHQUFDLENBQUMsRUFBTSxDQUFDLEVBQU0sQ0FBQyxFQUFNLENBQUMsQ0FBQztBQUN4QixHQUFDLENBQUMsRUFBTSxDQUFDLEVBQU0sQ0FBQyxFQUFNLENBQUMsQ0FBQztBQUN4QixHQUFDLENBQUMsRUFBTSxDQUFDLEVBQU0sQ0FBQyxFQUFNLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQzs7QUFFeEQsWUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXRDLGlCQUFlLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQyxDQUFHLEVBQUUsS0FBSyxFQUFFLElBQUssRUFBRSxDQUFDLENBQUMsRUFDZixDQUFDLENBQUcsRUFBQyxDQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFDdEIsQ0FBQyxDQUFHLEVBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBSSxDQUFDLEVBQU0sQ0FBQyxFQUFNLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQzs7QUFFN0QsU0FBTyxRQUFRLENBQUM7Q0FDakIsQ0FBQyxDQUFDOzs7OztRQzdKYSxVQUFVLEdBQVYsVUFBVTtRQStCVixpQkFBaUIsR0FBakIsaUJBQWlCO1FBTWpCLGdCQUFnQixHQUFoQixnQkFBZ0I7OztRQVloQixlQUFlLEdBQWYsZUFBZTs7O1FBMkJmLFVBQVUsR0FBVixVQUFVOzs7O0FBaEYxQixTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUM5QixTQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDNUM7O0FBRU0sU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQzlCLE1BQUksR0FBRyxZQUFZLEtBQUssRUFBRTtBQUN4QixXQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsTUFBTSxFQUFFO0FBQ2xDLFlBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNiLENBQUMsQ0FBQztHQUNKOztBQUVELFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQzFDLFFBQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEIsT0FBRyxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQ3RCLFVBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsT0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEFBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUUzQyxVQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLFNBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFekIsVUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUzRCxZQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkIsU0FBRyxHQUFHLElBQUksQ0FBQztLQUNaLENBQUM7O0FBRUYsT0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFTLEdBQUcsRUFBRTtBQUMxQixZQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWixTQUFHLEdBQUcsSUFBSSxDQUFDO0tBQ1osQ0FBQzs7QUFFRixPQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztHQUNmLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUMvQyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUV6QyxTQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztDQUMxRDs7QUFFTSxTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRTtBQUNyQyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLE1BQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O01BRXhCLEtBQUssR0FBWSxJQUFJLENBQXJCLEtBQUs7TUFBRSxNQUFNLEdBQUksSUFBSSxDQUFkLE1BQU07O0FBQ2xCLEdBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEFBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRW5DLEtBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QixTQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDOUM7O0FBR00sU0FBUyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM1QyxNQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUUsVUFBQyxFQUFFO1dBQUssRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDO0dBQUEsQ0FBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQzs7QUFFdEQsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUVuQyxNQUFJLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVDLE1BQUksSUFBSSxHQUFHLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBSSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWpDLE9BQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUU7QUFDbEMsUUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsU0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUNSLEFBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQ2xMLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxBQUFDLEdBQ25MLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxBQUFDLEdBQ2xMLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEFBQUMsQUFDL0ssQ0FBQztHQUNIOztBQUVELE1BQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVwQixTQUFPLElBQUksQ0FBQztDQUNiOztBQUdNLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDdkMsTUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUV0RCxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRW5DLE9BQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUU7QUFDbEMsUUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3JDOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCJcblxuaW1wb3J0IHtsb2FkX2ltYWdlLCBjcmVhdGVfaW1hZ2VfZGF0YSwgY2xvbmVfaW1hZ2VfZGF0YSwgbXVsdGlwbHlfbWF0cml4LCBhZGRfbWF0cml4fSBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbWcoc3JjKSB7XG4gIHJldHVybiB1bml0KHNyYyk7XG59XG5cbnZhciBwcm90byA9IHt9O1xuXG5mdW5jdGlvbiB1bml0KHNyYykge1xuICB2YXIgcHJvbWlzZSA9IHNyYyBpbnN0YW5jZW9mIFByb21pc2UgPyBzcmMgOiBsb2FkX2ltYWdlKHNyYyk7XG5cbiAgcHJvbWlzZS5jYXRjaChmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coJ2xvYWQgcHJvbWlzZSBmYWlsZWQnLCBlKTtcbiAgfSk7XG5cbiAgdmFyIG1vbmFkID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbW9uYWQuYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdW5pdChwcm9taXNlLnRoZW4oZnVuY3Rpb24oaW1nKSB7XG4gICAgICAvL3ZhciB0MSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgdmFyIHJlcyA9IGZ1bmMoaW1nLCAuLi5hcmdzKTtcbiAgICAgIC8vdmFyIHQyID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCd0aW1pbmcgaXMgJywgdDItdDEsIGZ1bmMudG9TdHJpbmcoKS5tYXRjaCgvXmZ1bmN0aW9uXFxzKFxcdyspLylbMV0pO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pKTtcbiAgfTtcblxuICByZXR1cm4gbW9uYWQ7XG59XG5cbmZ1bmN0aW9uIGxpZnQobmFtZSwgZnVuYykge1xuICBwcm90b1tuYW1lXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGZ1bmMsIC4uLmFyZ3MpO1xuICB9O1xufVxuXG5saWZ0KCdvdXRwdXRUbycsIGZ1bmN0aW9uIG91dHB1dFRvKGRhdGEsIGVsKSB7XG4gIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGMud2lkdGggPSBkYXRhLndpZHRoOyBjLmhlaWdodCA9IGRhdGEuaGVpZ2h0O1xuXG4gIHZhciBjdHggPSBjLmdldENvbnRleHQoJzJkJyk7XG4gIGN0eC5wdXRJbWFnZURhdGEoZGF0YSwgMCwgMCk7XG5cbiAgZWwuaW5uZXJIVE1MID0gJyc7XG4gIGVsLmFwcGVuZENoaWxkKGMpO1xufSk7XG5cbmxpZnQoJ2lkZW50aXR5JywgZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbmV3X2RhdGEgPSBjcmVhdGVfaW1hZ2VfZGF0YShkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gIHZhciBjdXJfcG9zLCBuZXdfcG9zO1xuXG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGF0YS53aWR0aDsgKyt4KSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBkYXRhLmhlaWdodDsgKyt5KSB7XG4gICAgICBjdXJfcG9zID0gKHkgKiBkYXRhLndpZHRoICsgeCkgKiA0O1xuICAgICAgbmV3X3BvcyA9ICh5ICogZGF0YS53aWR0aCArIHgpICogNDtcblxuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zXSA9IGRhdGEuZGF0YVtjdXJfcG9zXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDFdID0gZGF0YS5kYXRhW2N1cl9wb3MgKyAxXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDJdID0gZGF0YS5kYXRhW2N1cl9wb3MgKyAyXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDNdID0gZGF0YS5kYXRhW2N1cl9wb3MgKyAzXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3X2RhdGE7XG59KTtcblxubGlmdCgnaWRlbnRpdHkyJywgZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbmV3X2RhdGEgPSBjbG9uZV9pbWFnZV9kYXRhKGRhdGEpO1xuXG4gIHJldHVybiBtdWx0aXBseV9tYXRyaXgobmV3X2RhdGEsIFsgWzEsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLCAxLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMSwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsIDAsIDAsIDFdIF0pO1xufSk7XG5cbmxpZnQoJ2ZsaXBZJywgZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbmV3X2RhdGEgPSBjcmVhdGVfaW1hZ2VfZGF0YShkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gIHZhciBjdXJfcG9zLCBuZXdfcG9zO1xuXG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGF0YS53aWR0aDsgKyt4KSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBkYXRhLmhlaWdodDsgKyt5KSB7XG4gICAgICBjdXJfcG9zID0gKHkgKiBkYXRhLndpZHRoICsgeCkgKiA0O1xuICAgICAgbmV3X3BvcyA9ICgoZGF0YS5oZWlnaHQgLSB5IC0gMSkgKiBkYXRhLndpZHRoICsgeCkgKiA0O1xuXG4gICAgICBuZXdfZGF0YS5kYXRhW25ld19wb3NdID0gZGF0YS5kYXRhW2N1cl9wb3NdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgMV0gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDFdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgMl0gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDJdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgM10gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDNdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdfZGF0YTtcbn0pO1xuXG5saWZ0KCdmbGlwWCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIG5ld19kYXRhID0gY3JlYXRlX2ltYWdlX2RhdGEoZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICB2YXIgY3VyX3BvcywgbmV3X3BvcztcblxuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRhdGEud2lkdGg7ICsreCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgZGF0YS5oZWlnaHQ7ICsreSkge1xuICAgICAgY3VyX3BvcyA9ICh5ICogZGF0YS53aWR0aCArIHgpICogNDtcbiAgICAgIG5ld19wb3MgPSAoeSAqIGRhdGEud2lkdGggKyAoZGF0YS53aWR0aCAtIHggLSAxKSkgKiA0O1xuXG4gICAgICBuZXdfZGF0YS5kYXRhW25ld19wb3NdID0gZGF0YS5kYXRhW2N1cl9wb3NdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgMV0gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDFdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgMl0gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDJdO1xuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zICsgM10gPSBkYXRhLmRhdGFbY3VyX3BvcyArIDNdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdfZGF0YTtcbn0pO1xuXG5saWZ0KCdpbnZlcnNlJywgZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbmV3X2RhdGEgPSBjcmVhdGVfaW1hZ2VfZGF0YShkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gIHZhciBjdXJfcG9zLCBuZXdfcG9zO1xuXG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGF0YS53aWR0aDsgKyt4KSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBkYXRhLmhlaWdodDsgKyt5KSB7XG4gICAgICBjdXJfcG9zID0gKHkgKiBkYXRhLndpZHRoICsgeCkgKiA0O1xuICAgICAgbmV3X3BvcyA9ICh5ICogZGF0YS53aWR0aCArIHgpICogNDtcblxuICAgICAgbmV3X2RhdGEuZGF0YVtuZXdfcG9zXSA9IDI1NSAtIGRhdGEuZGF0YVtjdXJfcG9zXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDFdID0gMjU1IC0gZGF0YS5kYXRhW2N1cl9wb3MgKyAxXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDJdID0gMjU1IC0gZGF0YS5kYXRhW2N1cl9wb3MgKyAyXTtcbiAgICAgIG5ld19kYXRhLmRhdGFbbmV3X3BvcyArIDNdID0gZGF0YS5kYXRhW2N1cl9wb3MgKyAzXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3X2RhdGE7XG59KTtcblxubGlmdCgnZ3JheXNjYWxlJywgZnVuY3Rpb24gZ3JheXNjYWxlMihkYXRhKSB7XG4gIHZhciBuZXdfZGF0YSA9IGNsb25lX2ltYWdlX2RhdGEoZGF0YSk7XG5cbiAgcmV0dXJuIG11bHRpcGx5X21hdHJpeChuZXdfZGF0YSwgWyBbMC4yMSwgMC43MiwgMC4wNywgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzAuMjEsIDAuNzIsIDAuMDcsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLjIxLCAwLjcyLCAwLjA3LCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCAgICwgMCwgICAgMCwgICAgMV0gXSk7XG59KTtcblxuLy8gaHR0cDovL2NvbnRlbnQuZ3B3aWtpLm9yZy9EM0RCb29rOlVzZWZ1bF9FZmZlY3RfU25pcHBldHNcbmxpZnQoJ3NlcGlhJywgZnVuY3Rpb24gc2VwaWEoZGF0YSwgdG9uZSA9IDQwKSB7XG4gIHZhciBuZXdfZGF0YSA9IGNsb25lX2ltYWdlX2RhdGEoZGF0YSk7XG5cbiAgbXVsdGlwbHlfbWF0cml4KG5ld19kYXRhLCBbIFswLjI5OSwgMC41ODcsIDAuMTE0LCAwXSwgLy9ZXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgICAgIDAsICAgICAwLCAgICAgMF0sIC8vSSwgbm90IHVzZWQgPF0gWzAuNTk2LC0wLjI3NSwtMC4zMjEsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsICAgICAwLCAgICAgMCwgICAgIDBdLCAvL1EsIG5vdCB1c2VkIDxdIFswLjIxMiwtMC41MjMsIDAuMzExLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswICAgICwgMCwgICAgIDAsICAgICAxXSBdKTtcblxuICBhZGRfbWF0cml4KG5ld19kYXRhLCBbMCwgdG9uZSwgMCwgMF0pO1xuXG4gIG11bHRpcGx5X21hdHJpeChuZXdfZGF0YSwgWyBbMS4wLCAwLjk1NiwgMC42MjAsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxLjAsLTAuMjcyLC0wLjY0NywgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEuMCwtMS4xMDgsIDEuNzA1LCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCAgLCAwLCAgICAgMCwgICAgIDFdIF0pO1xuXG4gIHJldHVybiBuZXdfZGF0YTtcbn0pO1xuIiwiZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1heChNYXRoLm1pbih2YWx1ZSwgbWF4KSwgbWluKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRfaW1hZ2Uoc3JjKSB7XG4gIGlmIChzcmMgaW5zdGFuY2VvZiBJbWFnZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihhY2NlcHQpIHtcbiAgICAgIGFjY2VwdChzcmMpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKGFjY2VwdCwgcmVqZWN0KSB7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjLndpZHRoID0gaW1nLndpZHRoOyBjLmhlaWdodCA9IGltZy5oZWlnaHQ7XG5cbiAgICAgIHZhciBjdHggPSBjLmdldENvbnRleHQoJzJkJyk7XG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG5cbiAgICAgIHZhciBpbWFnZV9kYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjLndpZHRoLCBjLmhlaWdodCk7XG5cbiAgICAgIGFjY2VwdChpbWFnZV9kYXRhKTtcbiAgICAgIGltZyA9IG51bGw7XG4gICAgfTtcblxuICAgIGltZy5vbmVycm9yID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICAgIGltZyA9IG51bGw7XG4gICAgfTtcblxuICAgIGltZy5zcmMgPSBzcmM7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2ltYWdlX2RhdGEod2lkdGgsIGhlaWdodCkge1xuICB2YXIgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG4gIHJldHVybiBjLmdldENvbnRleHQoXCIyZFwiKS5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZV9pbWFnZV9kYXRhKGRhdGEpIHtcbiAgbGV0IGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgbGV0IGN0eCA9IGMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gIGxldCB7d2lkdGgsIGhlaWdodH0gPSBkYXRhO1xuICBjLndpZHRoID0gd2lkdGg7IGMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gIGN0eC5wdXRJbWFnZURhdGEoZGF0YSwgMCwgMCk7XG4gIHJldHVybiBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xufVxuXG4vKiB3aWxsIG1vZGlmeSBkYXRhIGlucGxhY2UgKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseV9tYXRyaXgoZGF0YSwgbWF0cml4KSB7XG4gIGlmIChtYXRyaXgubGVuZ3RoICE9PSA0IHx8IG1hdHJpeC5maWx0ZXIoIChlbCkgPT4gZWwubGVuZ3RoICE9PSA0ICkubGVuZ3RoID4gMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaWx0ZXIgbWF0cml4IGNhbiBiZSBvbmx5IDQgYnkgNFwiKTtcblxuICBsZXQgbWF4ID0gZGF0YS53aWR0aCAqIGRhdGEuaGVpZ2h0O1xuXG4gIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoZGF0YS5kYXRhLmxlbmd0aCk7XG4gIHZhciBidWY4ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJ1Zik7XG4gIHZhciBidWYzMiA9IG5ldyBVaW50MzJBcnJheShidWYpO1xuXG4gIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IG1heDsgKytwb3MpIHtcbiAgICBsZXQgcmVhbF9wb3MgPSBwb3MgKiA0O1xuXG4gICAgYnVmMzJbcG9zXSA9IChcbiAgICAgIChjbGFtcChkYXRhLmRhdGFbcmVhbF9wb3NdICogbWF0cml4WzNdWzBdICsgZGF0YS5kYXRhW3JlYWxfcG9zICsgMV0gKiBtYXRyaXhbM11bMV0gKyBkYXRhLmRhdGFbcmVhbF9wb3MgKyAyXSAqIG1hdHJpeFszXVsyXSArIGRhdGEuZGF0YVtyZWFsX3BvcyArIDNdICogbWF0cml4WzNdWzNdLCAwLCAyNTUpIDw8IDI0KSB8XG4gICAgICAoY2xhbXAoZGF0YS5kYXRhW3JlYWxfcG9zXSAqIG1hdHJpeFsyXVswXSArIGRhdGEuZGF0YVtyZWFsX3BvcyArIDFdICogbWF0cml4WzJdWzFdICsgZGF0YS5kYXRhW3JlYWxfcG9zICsgMl0gKiBtYXRyaXhbMl1bMl0gKyBkYXRhLmRhdGFbcmVhbF9wb3MgKyAzXSAqIG1hdHJpeFsyXVszXSwgMCwgMjU1KSA8PCAxNikgfFxuICAgICAgKGNsYW1wKGRhdGEuZGF0YVtyZWFsX3Bvc10gKiBtYXRyaXhbMV1bMF0gKyBkYXRhLmRhdGFbcmVhbF9wb3MgKyAxXSAqIG1hdHJpeFsxXVsxXSArIGRhdGEuZGF0YVtyZWFsX3BvcyArIDJdICogbWF0cml4WzFdWzJdICsgZGF0YS5kYXRhW3JlYWxfcG9zICsgM10gKiBtYXRyaXhbMV1bM10sIDAsIDI1NSkgPDwgOCkgfFxuICAgICAgKGNsYW1wKGRhdGEuZGF0YVtyZWFsX3Bvc10gKiBtYXRyaXhbMF1bMF0gKyBkYXRhLmRhdGFbcmVhbF9wb3MgKyAxXSAqIG1hdHJpeFswXVsxXSArIGRhdGEuZGF0YVtyZWFsX3BvcyArIDJdICogbWF0cml4WzBdWzJdICsgZGF0YS5kYXRhW3JlYWxfcG9zICsgM10gKiBtYXRyaXhbMF1bM10sIDAsIDI1NSkpXG4gICAgKTtcbiAgfVxuXG4gIGRhdGEuZGF0YS5zZXQoYnVmOCk7XG5cbiAgcmV0dXJuIGRhdGE7XG59XG5cbi8qIHdpbGwgbW9kaWZ5IGRhdGEgaW5wbGFjZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZF9tYXRyaXgoZGF0YSwgbWF0cml4KSB7XG4gIGlmIChtYXRyaXgubGVuZ3RoICE9PSA0KVxuICAgIHRocm93IG5ldyBFcnJvcihcImZpbHRlciBtYXRyaXggY2FuIGJlIG9ubHkgNCBieSA0XCIpO1xuXG4gIGxldCBtYXggPSBkYXRhLndpZHRoICogZGF0YS5oZWlnaHQ7XG5cbiAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgbWF4OyArK3Bvcykge1xuICAgIGxldCByZWFsX3BvcyA9IHBvcyAqIDQ7XG5cbiAgICBkYXRhLmRhdGFbcmVhbF9wb3MgKyAwXSArPSBtYXRyaXhbMF1cbiAgICBkYXRhLmRhdGFbcmVhbF9wb3MgKyAxXSArPSBtYXRyaXhbMV1cbiAgICBkYXRhLmRhdGFbcmVhbF9wb3MgKyAyXSArPSBtYXRyaXhbMl1cbiAgICBkYXRhLmRhdGFbcmVhbF9wb3MgKyAzXSArPSBtYXRyaXhbM11cbiAgfVxuXG4gIHJldHVybiBkYXRhO1xufVxuIl19
