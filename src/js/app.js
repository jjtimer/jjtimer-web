var Event = require('jjtimer-core/src/Event');
var Session = require('jjtimer-core/src/Session')();
var Scrambler = require('jjtimer-core/src/Scrambler')();
var format_time = require('./TimeFormatter');
var SessionFormatter = require('./SessionList')(Session);

var Util = {
  setInterval: setInterval.bind(window),
  clearInterval: clearInterval.bind(window),
  getMilli: window.performance && window.performance.now
                 ? window.performance.now.bind(window.performance)
                 : Date.now.bind(Date)
};

var Timer = require('jjtimer-core/src/Timer')(Event, Util);

function generic(turns, suffixes, length) {
  function randn(n) {  return Math.floor(Math.random() * n); }
  function rand_el(x) { return x[randn(x.length)]; }

  return function(){
    var donemoves = [];
    var lastaxis = -1;
    var s = "";
    for(var j = 0; j < length; j++){
      var done = 0;
      while(done === 0) {
        var first = randn(turns.length);
        var second = randn(turns[first].length);
        if(first != lastaxis) {
          for(var k=0; k < turns[first].length; k++) donemoves[k] = 0;
          lastaxis = first;
        }
        if(donemoves[second] === 0) {
          donemoves[second] = 1;
          s += (turns[first][second]) instanceof Array ?
            rand_el(turns[first][second]) : turns[first][second];
          s += rand_el(suffixes) + " ";
          done = 1;
        }
      }
    }
    return s;
  };
}

Scrambler.register({
  name1 : "4x4",
  get : generic([["U", "D", "u"], ["R", "L", "r"], ["F", "B", "f"]],
                ["", "2", "'"], 40)
});
Scrambler.register({
  name1 : "3x3",
  get : generic([["U", "D"], ["R", "L"], ["F", "B"]], ["", "2", "'"], 25)
});

var currentScrambler = Scrambler.get(0);

var allKeysStop = true;

function reset() {
  Timer.reset();
  Session.reset();
  $('time').innerHTML = 'ready';
  Event.emit('session/updated');
}

var $ = document.getElementById.bind(document);

function show(id) {
  $(id).style.display = 'inline';
}

function hide(id) {
  $(id).style.display = 'none';
}

function toggle(id) {
  $(id).style.display = ($(id).style.display == 'none' ? 'inline' : 'none');
}

function toggle_(el) {
  var c = document.getElementById(el).className;
  document.getElementById(el).className = (c == "show") ? "hide" : "show";
}

Event.on('timer/started', function() {
  document.body.classList.add('running');
});

Event.on('timer/running', function() {
  $('time').innerHTML = format_time(Timer.getCurrent());
});

Event.on('timer/stopped', function() {
  var col = window.getComputedStyle($('time')).getPropertyValue('color');
  $('time').innerHTML = format_time(Timer.getCurrent());
  Session.add({
    time: Timer.getCurrent(),
    scramble: $('scramble').innerHTML,
    splits: Timer.getSplits(),
    color: col
  });
  $('scramble').innerHTML = currentScrambler.get();
  Event.emit('session/updated');
  document.body.classList.remove('running');
});

var isTouch = (window.ontouchstart !== undefined);
if (isTouch) {
  document.ontouchstart = function(ev) {
    if (ev.target != $('scramblers') && ev.target.parentNode != $('session'))
      Timer.triggerDown();
  };

  document.ontouchend = function(ev) {
    if (ev.target != $('scramblers'))
      Timer.triggerUp();
  };
}

var Keyboard = (function() {
  function up(key, fn) { Event.on('keyboard/up/' + key, fn); }
  function down(key, fn) { Event.on('keyboard/down/' + key, fn); }
  function up_handler(ev) {
    if(ev.keyCode == 32 || ev.keyCode == 9)
      ev.preventDefault();
    Event.emit('keyboard/up/' + ev.keyCode);
  }
  function down_handler(ev) {
    if(ev.keyCode == 32 || ev.keyCode == 9)
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
})();

Keyboard.down(Keyboard.space, function() {
  if ($('options').classList.contains('hide'))
    return;
  if ($('detail').classList.contains('show-detail')) {
    $('detail').classList.toggle('show-detail');
    $('detail').classList.toggle('hide-detail');
  }
  Timer.triggerDown();
});
Keyboard.up(Keyboard.space, function() {
  Timer.triggerUp();
});

Keyboard.up(Keyboard.esc, reset);

Keyboard.up(68, function() {
  Session.remove();
  Event.emit('session/updated');
});

Keyboard.up(13, function() {
  $('user-style').innerHTML = $('css-input').value;
});

document.addEventListener('keydown', Keyboard.down_handler);
document.addEventListener('keyup', Keyboard.up_handler);

Event.on('session/updated', function() {
  SessionFormatter.format(Session);
  $('session-count').innerHTML = Session.length();
  if (Session.length() < 3) {
    hide('session-avg-outer');
    hide('current-avg-all-outer');
    hide('best-avg-all-outer');
    hide('current-avg-12-outer');
    hide('best-avg-12-outer');
  } else {
    show('session-avg-outer');
    $('session-avg').innerHTML = format_time(Session.average().avg);
  }
  if (Session.length() >= 5) {
    $('current-avg-5').innerHTML = format_time(Session.current_average(5).avg);
    $('best-avg-5').innerHTML = format_time(Session.best_average(5).avg);
    show('current-avg-all-outer');
    show('best-avg-all-outer');
  }
  if (Session.length() >= 12) {
    $('current-avg-12').innerHTML = format_time(Session.current_average(12).avg);
    $('best-avg-12').innerHTML = format_time(Session.best_average(12).avg);
    show('current-avg-12-outer');
    show('best-avg-12-outer');
  }
  $('right').scrollTop = $('right').scrollHeight;
});

window.addEventListener('load', function() {
  $('scramble').innerHTML = currentScrambler.get();
  var scramblersList = $('scramblers').options;
  for(var i = 0; i < Scrambler.length(); ++i) {
    var scrambler = Scrambler.get(i);
    scramblersList[scramblersList.length] = new Option(scrambler.name1);
  }
  $('scramblers').addEventListener('change', function() {
    currentScrambler = Scrambler.get(this.selectedIndex);
    $('scramble').innerHTML = currentScrambler.get();
    toggle_('top');
    toggle_('options');
  });
  $('btn-reset').addEventListener('click', reset);
  if (!isTouch) {
    toggle('btn-reset');
  }
  $('css-input').addEventListener('keydown', function(e) {
    e.stopPropagation();
    return false;
  });
  $('css-input').addEventListener('keyup', function(e) {
    e.stopPropagation();
    $('user-style').innerHTML = $('css-input').value;
    return false;
  });
  Array.prototype.forEach.call(document.getElementsByClassName('options'),
                               function(el) {
    el.addEventListener('click', function() {
      toggle_('top');
      toggle_('options');
    });
  });
  $('current-avg-5').addEventListener('click', function() {
    SessionFormatter.highlight(Session.length() - 5, 5,
                               Session.current_average(5).min,
                               Session.current_average(5).max);
  });
  $('best-avg-5').addEventListener('click', function() {
    SessionFormatter.highlight(Session.best_average(5).index, 5,
                               Session.best_average(5).min,
                               Session.best_average(5).max);
  });
  $('current-avg-12').addEventListener('click', function() {
    SessionFormatter.highlight(Session.length() - 12, 12,
                               Session.current_average(12).min,
                               Session.current_average(12).max);
  });
  $('best-avg-12').addEventListener('click', function() {
    SessionFormatter.highlight(Session.best_average(12).index, 12,
                               Session.best_average(12).min,
                               Session.best_average(12).max);
  });
  Event.emit('session/updated');
});

window.addEventListener('blur', function() {
  document.body.classList.add('disabled');
  $('time').classList.add('disabled');
});

window.addEventListener('focus', function() {
  document.body.classList.remove('disabled');
  $('time').classList.remove('disabled');
});
