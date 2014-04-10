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

function format_time(time) {
  if (time < 0)
    return 'DNF';

  time = Math.round(time / 10);
  var bits = time % 100;
  time = (time - bits) / 100;
  var secs = time % 60;
  var mins = ((time - secs) / 60) % 60;

  var out = [bits];
  if (bits < 10) {
    out.push('0');
  }
  out.push('.');
  out.push(secs);
  if (secs < 10 && mins > 0) {
    out.push('0');
  }
  if (mins > 0) {
    out.push(':');
    out.push(mins)
  }
  return out.reverse().join('');
}

var SessionFormatter = (function () {
  function format(session) {
    var out = "";
    for(var i = 0; i < session.length(); ++i) {
      out += format_time(session.at(i).time) + ", ";
    }
    return out.substr(0, out.length - 2);
  }
  return { format: format };
})();

Event.on('timer/running', function() {
  document.getElementById('time').innerHTML = format_time(Timer.getCurrent());
});

Event.on('timer/stopped', function() {
  Session.add({ time: Timer.getCurrent() });
  document.getElementById('time').innerHTML = format_time(Timer.getCurrent());
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
