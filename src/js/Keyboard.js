var Event = require('jjtimer-core/src/Event');

var Keyboard = (function(Timer) {
  var allKeysStop = false;
  function up(key, fn) { Event.on('keyboard/up/' + key, fn); }
  function down(key, fn) { Event.on('keyboard/down/' + key, fn); }
  function up_handler(ev) {
    if (ev.keyCode == 32 || ev.keyCode == 9)
      ev.preventDefault();
    Event.emit('keyboard/up/' + ev.keyCode);
  }
  function down_handler(ev) {
    if (ev.keyCode == 32 || ev.keyCode == 9)
      ev.preventDefault();
    Event.emit('keyboard/down/' + ev.keyCode);
    if (allKeysStop && Timer.isRunning() && ev.keyCode != 32)
      Event.emit('keyboard/down/32');
  }
  return {
    up: up,
    down: down,
    up_handler: up_handler,
    down_handler: down_handler,
    space: 32,
    esc: 27
  };
});

module.exports = Keyboard;
