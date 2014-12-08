var Event = require('jjtimer-core/src/Event');
var Storage = require('./Storage')();
var Session = require('jjtimer-core/src/Session')();
var Scrambler = require('jjtimer-core/src/Scrambler')();
var format_time = require('./TimeFormatter');
var SessionList = require('./SessionList')();
var Stats = require('./Stats')(Session);

var requestAnimationFrame = require('./requestAnimationFrame');
var cancelAnimationFrame = require('./cancelAnimationFrame');


function setInterval(fn, delay) {
  // Have to use an object here to store a reference
  // to the requestAnimationFrame ID.
  var handle = {};

  function interval() {
    fn.call();
    handle.value = requestAnimationFrame(interval)
  }

  handle.value = requestAnimationFrame(interval);
  return handle;
}

function clearInterval(interval) {
  cancelAnimationFrame(interval.value);
}

var Util = {
  setInterval: setInterval,
  clearInterval: clearInterval,
  getMilli: window.performance && window.performance.now
                 ? window.performance.now.bind(window.performance)
                 : Date.now.bind(Date)
};

var Timer = require('jjtimer-core/src/Timer')(Event, Util);
var Keyboard = require('./Keyboard')(Timer);

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
  name1: "4x4",
  get: generic([["U", "D", "u"], ["R", "L", "r"], ["F", "B", "f"]],
                ["", "2", "'"], 40)
});

Scrambler.register({
  name1: "3x3",
  get: generic([["U", "D"], ["R", "L"], ["F", "B"]], ["", "2", "'"], 25)
});

Scrambler.register({
  name1: "clock (WCA)",
  get: function() {
    function randn(n) { return Math.floor(Math.random() * n); }
    var scramble = [];
    var turns=["UR","DR","DL","UL","U","R","D","L","ALL","U","R","D","L","ALL"];
    for(var i = 0; i < 14; i++){
      var turn = randn(12) - 5;
      var clockwise = turn >= 0;
      turn = Math.abs(turn);
      scramble.push(turns[i] + turn + (clockwise ? '+' : '-'));
      if (i == 8){
        scramble.push('y2');
      }
    }

    for(var i = 0; i < 4; ++i) {
      if (randn(2)) {
        scramble.push(turns[i]);
     }
    }

    return scramble.join(' ');
  }
});

var config = {};
var currentScrambler;

function reset() {
  Timer.reset();
  Session.reset();
  $('time').textContent = 'ready';
  Event.emit('session/updated');
}

var $ = document.getElementById.bind(document);

function toggle(id) {
  $(id).style.display = ($(id).style.display == 'none' ? 'inline' : 'none');
}

function toggleOptions() {
  $('top').classList.toggle('toggle-options');
  $('options').classList.toggle('toggle-options');
}

Event.on('timer/started', function() {
  document.body.classList.add('running');
});

Event.on('timer/running', function() {
  $('time').textContent = format_time(Timer.getCurrent());
});

Event.on('timer/stopped', function() {
  var col = window.getComputedStyle($('time')).getPropertyValue('color');
  $('time').textContent = format_time(Timer.getCurrent());
  Session.add({
    time: Timer.getCurrent(),
    scramble: $('scramble').textContent,
    splits: Timer.getSplits(),
    color: col
  });
  $('scramble').textContent = currentScrambler.get();
  Event.emit('session/updated');
  document.body.classList.remove('running');
});

Keyboard.down(Keyboard.space, function() {
  if ($('options').classList.contains('toggle-options'))
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

Keyboard.up(Keyboard.esc, function() {
  if (Session.length() > 0 && confirm("Do you want to reset the session?")) {
    reset();
  }
});

Keyboard.up(68, function() {
  Session.remove();
  Event.emit('session/updated');
});



document.addEventListener('keydown', Keyboard.down_handler);
document.addEventListener('keyup', Keyboard.up_handler);

Event.on('session/updated', function() {
  SessionList.render(Session);
  Stats.render();
  $('right').scrollTop = $('right').scrollHeight;
});

window.addEventListener('load', function() {
  if (Storage.isAvailable) {
    var savedSolves = Storage.get('session.solves');
    if (savedSolves) {
      Session.replaceSolves(savedSolves);
    }
    config = Storage.get('config') || {};
  }
  config['scramblerIndex'] = config['scramblerIndex'] || 0;
  currentScrambler = Scrambler.get(config['scramblerIndex']);
  $('scramble').textContent = currentScrambler.get();
  var scramblersList = $('scramblers').options;
  for(var i = 0; i < Scrambler.length(); ++i) {
    var scrambler = Scrambler.get(i);
    scramblersList[scramblersList.length] = new Option(scrambler.name1);
  }
  $('scramblers').selectedIndex = config['scramblerIndex'];
  $('scramblers').addEventListener('change', function() {
    currentScrambler = Scrambler.get(this.selectedIndex);
    $('scramble').textContent = currentScrambler.get();
    toggleOptions();
    config['scramblerIndex'] = this.selectedIndex;
  });
  $('btn-reset').addEventListener('click', reset);
  var isTouch = (window.ontouchstart !== undefined);
  if (isTouch) {
    $('top').addEventListener('touchstart', Timer.triggerDown);
    $('top').addEventListener('touchend', Timer.triggerUp);
  } else {
    toggle('btn-reset');
  }
  $('css-input').addEventListener('keydown', function(e) {
    e.stopPropagation();
    return false;
  });
  $('css-input').addEventListener('keyup', function(e) {
    e.stopPropagation();
    $('user-style').textContent = $('css-input').value;
    return false;
  });


  $('ui-stats-type').addEventListener('change', function(e) {
    Stats.setCompact(this.checked);
    config['ui-stats-compact'] = this.checked;
  });
  $('ui-stats-type').checked = config['ui-stats-compact'];
  Stats.setCompact(config['ui-stats-compact']);
  Array.prototype.forEach.call(document.getElementsByClassName('options'),
                               function(el) {
    el.addEventListener('click', toggleOptions);
  });
  Stats.init();

  $('delete').addEventListener('click', function() {
    var detailContainer = $('detail');
    Session.remove( detailContainer.getAttribute('data-solveId'));
    detailContainer.classList.toggle("show-detail");
    detailContainer.classList.toggle("hide-detail");
    Event.emit('session/updated');
  });

  Event.emit('session/updated');
});

Event.on('current-avg-5/highlight', function() {
  SessionList.render(Session, Session.length() - 5, 5,
                        Session.current_average(5).min,
                        Session.current_average(5).max);
});

Event.on('best-avg-5/highlight', function() {
  SessionList.render(Session, Session.best_average(5).index, 5,
                        Session.best_average(5).min,
                        Session.best_average(5).max);
});

Event.on('current-avg-12/highlight', function() {
  SessionList.render(Session, Session.length() - 12, 12,
                        Session.current_average(12).min,
                        Session.current_average(12).max);
});

Event.on('best-avg-12/highlight', function() {
  SessionList.render(Session, Session.best_average(12).index, 12,
                        Session.best_average(12).min,
                        Session.best_average(12).max);
});

window.addEventListener("beforeunload", function (e) {
  if (Storage.isAvailable) {
    if(Session.length() > 0) {
      Storage.put('session.solves', Session.getSolves());
    } else {
      Storage.remove('session.solves');
    }
    Storage.put('config', config);
  }
});

window.addEventListener('blur', function() {
  document.body.classList.add('disabled');
  $('time').classList.add('disabled');
});

window.addEventListener('focus', function() {
  document.body.classList.remove('disabled');
  $('time').classList.remove('disabled');
});
