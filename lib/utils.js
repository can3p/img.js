function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

export function load_image(src) {
  if (src instanceof Image) {
    return new Promise(function(accept) {
      accept(src);
    });
  }

  return new Promise(function(accept, reject) {
    var img = new Image();
    img.onload = function() {
      var c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;

      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      var image_data = ctx.getImageData(0, 0, c.width, c.height);

      accept(image_data);
      img = null;
    };

    img.onerror = function(err) {
      reject(err);
      img = null;
    };

    img.src = src;
  });
}

export function create_image_data(width, height) {
  var c = document.createElement('canvas');

  return c.getContext("2d").createImageData(width, height);
}

export function clone_image_data(data) {
  let c = document.createElement('canvas');
  let ctx = c.getContext("2d");

  let {width, height} = data;
  c.width = width; c.height = height;

  ctx.putImageData(data, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

/* will modify data inplace */
export function multiply_matrix(data, matrix) {
  if (matrix.length !== 4 || matrix.filter( (el) => el.length !== 4 ).length > 0)
    throw new Error("filter matrix can be only 4 by 4");

  let max = data.width * data.height;

  var buf = new ArrayBuffer(data.data.length);
  var buf8 = new Uint8ClampedArray(buf);
  var buf32 = new Uint32Array(buf);

  for (let pos = 0; pos < max; ++pos) {
    let real_pos = pos * 4;

    buf32[pos] = (
      (clamp(data.data[real_pos] * matrix[3][0] + data.data[real_pos + 1] * matrix[3][1] + data.data[real_pos + 2] * matrix[3][2] + data.data[real_pos + 3] * matrix[3][3], 0, 255) << 24) |
      (clamp(data.data[real_pos] * matrix[2][0] + data.data[real_pos + 1] * matrix[2][1] + data.data[real_pos + 2] * matrix[2][2] + data.data[real_pos + 3] * matrix[2][3], 0, 255) << 16) |
      (clamp(data.data[real_pos] * matrix[1][0] + data.data[real_pos + 1] * matrix[1][1] + data.data[real_pos + 2] * matrix[1][2] + data.data[real_pos + 3] * matrix[1][3], 0, 255) << 8) |
      (clamp(data.data[real_pos] * matrix[0][0] + data.data[real_pos + 1] * matrix[0][1] + data.data[real_pos + 2] * matrix[0][2] + data.data[real_pos + 3] * matrix[0][3], 0, 255))
    );
  }

  data.data.set(buf8);

  return data;
}

/* will modify data inplace */
export function add_matrix(data, matrix) {
  if (matrix.length !== 4)
    throw new Error("filter matrix can be only 4 by 4");

  let max = data.width * data.height;

  for (let pos = 0; pos < max; ++pos) {
    let real_pos = pos * 4;

    data.data[real_pos + 0] += matrix[0]
    data.data[real_pos + 1] += matrix[1]
    data.data[real_pos + 2] += matrix[2]
    data.data[real_pos + 3] += matrix[3]
  }

  return data;
}
