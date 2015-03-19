(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.img = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = img;

function img(src) {
  return unit(src);
}

var proto = {};

function load(src) {
  if (src instanceof Image) {
    return new Promise(function (accept) {
      accept(src);
    });
  }

  return new Promise(function (accept, reject) {
    var img = new Image();
    img.onload = function () {
      accept(img);
    };

    img.onerror = function (err) {
      reject(err);
    };

    img.src = src;
  });
}

function unit(src) {
  var promise = src instanceof Promise ? src : load(src);

  promise["catch"](function (e) {
    console.log("load promise failed", e);
  });

  var monad = Object.create(proto);

  monad.bind = function (func) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return unit(promise.then(function (img) {
      return func.apply(undefined, [img].concat(args));
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

lift("outputTo", function outputTo(img, el) {
  var node = new Image();
  node.src = img.src;

  el.appendChild(node);
});

lift("flipY", function (img) {
  var c = document.createElement("canvas");
  c.width = img.width;c.height = img.height;

  var ctx = c.getContext("2d");
  ctx.scale(-1, 1);
  ctx.drawImage(img, -img.width, 0);

  var result = new Image();
  result.src = c.toDataURL();

  return result;
});

lift("flipX", function (img) {
  var c = document.createElement("canvas");
  c.width = img.width;c.height = img.height;

  var ctx = c.getContext("2d");
  ctx.scale(1, -1);
  ctx.drawImage(img, 0, -img.height);

  var result = new Image();
  result.src = c.toDataURL();

  return result;
});

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZHBldHJvdi9jb2RlL2pzL2ltZy5qcy9saWIvaW1nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7aUJDRXdCLEdBQUc7O0FBQVosU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFO0FBQy9CLFNBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2xCOztBQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakIsTUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxNQUFNLEVBQUU7QUFDbEMsWUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDMUMsUUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN0QixPQUFHLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDdEIsWUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2IsQ0FBQzs7QUFFRixPQUFHLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQzFCLFlBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNiLENBQUM7O0FBRUYsT0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7R0FDZixDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakIsTUFBSSxPQUFPLEdBQUcsR0FBRyxZQUFZLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2RCxTQUFPLFNBQU0sQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUN4QixXQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsQ0FBQzs7QUFFSCxNQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqQyxPQUFLLENBQUMsSUFBSSxHQUFHLFVBQVMsSUFBSSxFQUFXO3NDQUFOLElBQUk7QUFBSixVQUFJOzs7QUFDakMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNyQyxhQUFPLElBQUksbUJBQUMsR0FBRyxTQUFLLElBQUksRUFBQyxDQUFDO0tBQzNCLENBQUMsQ0FBQyxDQUFDO0dBQ0wsQ0FBQzs7QUFFRixTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDeEIsT0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQWtCOzs7c0NBQU4sSUFBSTtBQUFKLFVBQUk7OztBQUM1QixXQUFPLFFBQUEsSUFBSSxFQUFDLElBQUksTUFBQSxRQUFDLElBQUksU0FBSyxJQUFJLEVBQUMsQ0FBQztHQUNqQyxDQUFDO0NBQ0g7O0FBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQzFDLE1BQUksSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdkIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDOztBQUVuQixJQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RCLENBQUMsQ0FBQzs7QUFFSCxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVMsR0FBRyxFQUFFO0FBQzFCLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsR0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEFBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUUzQyxNQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLEtBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakIsS0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBRSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVuQyxNQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3pCLFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUUzQixTQUFPLE1BQU0sQ0FBQztDQUNmLENBQUMsQ0FBQzs7QUFFSCxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVMsR0FBRyxFQUFFO0FBQzFCLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsR0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEFBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUUzQyxNQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLEtBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsS0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVuQyxNQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3pCLFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUUzQixTQUFPLE1BQU0sQ0FBQztDQUNmLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbWcoc3JjKSB7XG4gIHJldHVybiB1bml0KHNyYyk7XG59XG5cbnZhciBwcm90byA9IHt9O1xuXG5mdW5jdGlvbiBsb2FkKHNyYykge1xuICBpZiAoc3JjIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24oYWNjZXB0KSB7XG4gICAgICBhY2NlcHQoc3JjKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihhY2NlcHQsIHJlamVjdCkge1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICBhY2NlcHQoaW1nKTtcbiAgICB9O1xuXG4gICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH07XG5cbiAgICBpbWcuc3JjID0gc3JjO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdW5pdChzcmMpIHtcbiAgdmFyIHByb21pc2UgPSBzcmMgaW5zdGFuY2VvZiBQcm9taXNlID8gc3JjIDogbG9hZChzcmMpO1xuXG4gIHByb21pc2UuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKCdsb2FkIHByb21pc2UgZmFpbGVkJywgZSk7XG4gIH0pO1xuXG4gIHZhciBtb25hZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1vbmFkLmJpbmQgPSBmdW5jdGlvbihmdW5jLCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIHVuaXQocHJvbWlzZS50aGVuKGZ1bmN0aW9uKGltZykge1xuICAgICAgcmV0dXJuIGZ1bmMoaW1nLCAuLi5hcmdzKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgcmV0dXJuIG1vbmFkO1xufVxuXG5mdW5jdGlvbiBsaWZ0KG5hbWUsIGZ1bmMpIHtcbiAgcHJvdG9bbmFtZV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChmdW5jLCAuLi5hcmdzKTtcbiAgfTtcbn1cblxubGlmdCgnb3V0cHV0VG8nLCBmdW5jdGlvbiBvdXRwdXRUbyhpbWcsIGVsKSB7XG4gIHZhciBub2RlID0gbmV3IEltYWdlKCk7XG4gIG5vZGUuc3JjID0gaW1nLnNyYztcblxuICBlbC5hcHBlbmRDaGlsZChub2RlKTtcbn0pO1xuXG5saWZ0KCdmbGlwWScsIGZ1bmN0aW9uKGltZykge1xuICB2YXIgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjLndpZHRoID0gaW1nLndpZHRoOyBjLmhlaWdodCA9IGltZy5oZWlnaHQ7XG5cbiAgdmFyIGN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY3R4LnNjYWxlKC0xLCAxKTtcbiAgY3R4LmRyYXdJbWFnZShpbWcsIC0gaW1nLndpZHRoLCAwKTtcblxuICB2YXIgcmVzdWx0ID0gbmV3IEltYWdlKCk7XG4gIHJlc3VsdC5zcmMgPSBjLnRvRGF0YVVSTCgpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59KTtcblxubGlmdCgnZmxpcFgnLCBmdW5jdGlvbihpbWcpIHtcbiAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgYy53aWR0aCA9IGltZy53aWR0aDsgYy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuXG4gIHZhciBjdHggPSBjLmdldENvbnRleHQoJzJkJyk7XG4gIGN0eC5zY2FsZSgxLCAtMSk7XG4gIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAtaW1nLmhlaWdodCk7XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBJbWFnZSgpO1xuICByZXN1bHQuc3JjID0gYy50b0RhdGFVUkwoKTtcblxuICByZXR1cm4gcmVzdWx0O1xufSk7XG4iXX0=
