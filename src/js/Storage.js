var Storage = (function() {
  var isAvailable = !!global.localStorage;
  function put(key, val) {
    global.localStorage.setItem(key, JSON.stringify(val));
  }
  function get(key) {
    return JSON.parse(global.localStorage.getItem(key));
  }
  function remove(key) {
    global.localStorage.removeItem(key);
  }
  return {
    isAvailable: isAvailable,
    put: put,
    get: get,
    remove: remove
  };
});

module.exports = Storage;
