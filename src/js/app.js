var Event = require('jjtimer-core/src/Event');
var Session = require('jjtimer-core/src/Session')();
var Util = {
  setInterval: setInterval.bind(window),
  clearInterval: clearInterval.bind(window),
  getMilli: performance.now.bind(performance)
};
var Timer = require('jjtimer-core/src/Timer')(Event, Util);

var Keyboard = (function() {
  function on(key, fn) { Event.on('keyboard/' + key, fn); }
  function handler(ev) { Event.emit('keyboard/' + ev.keyCode); }
  return { on: on, handler: handler, space: 32, esc: 27 };
})();

var SessionFormatter = (function () {
  function format(session) {
    var out = "";
    for(var i = 0; i < session.length(); ++i) {
      out += session.at(i).time + ", ";
    }
    return out.substr(0, out.length - 2);
  }
  return { format: format };
})();

Event.on('timer/running', function() {
  document.getElementById('time').innerHTML = Timer.getCurrent();
});

Event.on('timer/stopped', function() {
  Session.add({ time: Timer.getCurrent() });
  document.getElementById('time').innerHTML = Timer.getCurrent();
  document.getElementById('session').innerHTML =
      SessionFormatter.format(Session);
});

Keyboard.on(Keyboard.space, function() {
  Timer.triggerDown();
  Timer.triggerUp();
});

Keyboard.on(Keyboard.esc, function() {
  Session.reset();
  document.getElementById('time').innerHTML = "";
  document.getElementById('session').innerHTML =
      SessionFormatter.format(Session);
});

document.onkeydown = Keyboard.handler;
