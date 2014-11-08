var Event = require('jjtimer-core/src/Event');
var format_time = require('./TimeFormatter');
var $ = document.getElementById.bind(document);
function show(id) {
  var el = $(id) || id;
  el.style.display = 'inline';
}
function hide(id) {
  var el = $(id) || id;
  el.style.display = 'none';
}

var Stats = (function(Session) {
  function init() {
    var labels = ['current-avg-5', 'best-avg-5', 'current-avg-12', 'best-avg-12'];
    var emitFn = function(i) { return function() { Event.emit(i + "/highlight"); } };
    for(var i = 0; i < labels.length; ++i) {
      $(labels[i]).addEventListener('click', emitFn(labels[i]));
    }
  }
  function render() {
    $('session-count').textContent = Session.length();
    if (Session.length() < 3) {
      hide('session-avg-outer');
    } else {
      show('session-avg-outer');
      $('session-avg').textContent = format_time(Session.average().avg);
    }
    if (Session.length() >= 5) {
      $('current-avg-5').textContent = format_time(Session.current_average(5).avg);
      $('best-avg-5').textContent = format_time(Session.best_average(5).avg);
      show('current-avg-all-outer');
      show('best-avg-all-outer');
    } else {
      hide('current-avg-all-outer');
      hide('best-avg-all-outer');
    }
    if (Session.length() >= 12) {
      $('current-avg-12').textContent = format_time(Session.current_average(12).avg);
      $('best-avg-12').textContent = format_time(Session.best_average(12).avg);
      show('current-avg-12-outer');
      show('best-avg-12-outer');
    } else {
      hide('current-avg-12-outer');
      hide('best-avg-12-outer');
    }
  }
  function setCompact(isCompact) {
    var brs = $('stats').getElementsByTagName('br');
    var slice = Array.prototype.slice;
    var fn = isCompact ? hide : show;
    slice.call(brs, 0).forEach(fn);
  }
  return {
    init: init,
    render: render,
    setCompact: setCompact
  };
});

module.exports = Stats;
