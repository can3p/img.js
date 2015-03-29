"use strict"

import {load_image, create_image_data, clone_image_data, multiply_matrix} from './utils'

export default function img(src) {
  return unit(src);
}

var proto = {};

function unit(src) {
  var promise = src instanceof Promise ? src : load_image(src);

  promise.catch(function(e) {
    console.log('load promise failed', e);
  });

  var monad = Object.create(proto);

  monad.bind = function(func, ...args) {
    return unit(promise.then(function(img) {
      //var t1 = performance.now();
      var res = func(img, ...args);
      //var t2 = performance.now();
      //console.log('timing is ', t2-t1, func.toString().match(/^function\s(\w+)/)[1]);

      return res;
    }));
  };

  return monad;
}

function lift(name, func) {
  proto[name] = function(...args) {
    return this.bind(func, ...args);
  };
}

lift('outputTo', function outputTo(data, el) {
  var c = document.createElement('canvas');
  c.width = data.width; c.height = data.height;

  var ctx = c.getContext('2d');
  ctx.putImageData(data, 0, 0);

  el.innerHTML = '';
  el.appendChild(c);
});

lift('identity', function(data) {
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

lift('identity2', function(data) {
  var new_data = clone_image_data(data);

  return multiply_matrix(new_data, [ [1, 0, 0, 0],
                                     [0, 1, 0, 0],
                                     [0, 0, 1, 0],
                                     [0, 0, 0, 1] ]);
});

lift('flipY', function(data) {
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

lift('flipX', function(data) {
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

lift('inverse', function(data) {
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

lift('grayscale', function grayscale2(data) {
  var new_data = clone_image_data(data);

  return multiply_matrix(new_data, [ [0.21, 0.72, 0.07, 0],
                                     [0.21, 0.72, 0.07, 0],
                                     [0.21, 0.72, 0.07, 0],
                                     [0   , 0,    0,    1] ]);
});
