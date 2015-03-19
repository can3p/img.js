"use strict"

export default function img(src) {
  return unit(src);
}

var proto = {};

function load(src) {
  if (src instanceof Image) {
    return new Promise(function(accept) {
      accept(src);
    });
  }

  return new Promise(function(accept, reject) {
    var img = new Image();
    img.onload = function() {
      accept(img);
    };

    img.onerror = function(err) {
      reject(err);
    };

    img.src = src;
  });
}

function unit(src) {
  var promise = src instanceof Promise ? src : load(src);

  promise.catch(function(e) {
    console.log('load promise failed', e);
  });

  var monad = Object.create(proto);

  monad.bind = function(func, ...args) {
    return unit(promise.then(function(img) {
      return func(img, ...args);
    }));
  };

  return monad;
}

function lift(name, func) {
  proto[name] = function(...args) {
    return this.bind(func, ...args);
  };
}

lift('outputTo', function outputTo(img, el) {
  var node = new Image();
  node.src = img.src;

  el.appendChild(node);
});

lift('flipY', function(img) {
  var c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;

  var ctx = c.getContext('2d');
  ctx.scale(-1, 1);
  ctx.drawImage(img, - img.width, 0);

  var result = new Image();
  result.src = c.toDataURL();

  return result;
});

lift('flipX', function(img) {
  var c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;

  var ctx = c.getContext('2d');
  ctx.scale(1, -1);
  ctx.drawImage(img, 0, -img.height);

  var result = new Image();
  result.src = c.toDataURL();

  return result;
});
