var Storage = (function() {
  var isAvailable = !!global.localStorage;
  function put(key, val) {
   localStorage.setItem(key, JSON.stringify(val));
  }
  function get(key) {
    return JSON.parse(localStorage.getItem(key));
  }
  return {
    isAvailable: isAvailable,
    put: put,
    get: get
  };
});

module.exports = Storage;
