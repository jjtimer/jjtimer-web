var format_time = require('./TimeFormatter');
var $ = document.getElementById.bind(document);

var SessionFormatter = (function (Session) {
  function detail_time(ev) {
    var id = parseInt(ev.target.id.substr(1), 10);
    var solve = Session.at(id);
    $('detail').innerHTML =
        (id + 1) + ". " + format_time(solve.time) + " " + solve.scramble;
    $("detail").classList.toggle("show-detail");
    $("detail").classList.toggle("hide-detail");
  }
  function format(session) {
    var root = $('session'), child = null;
    var fragment = document.createDocumentFragment();
    var c = document.createElement('ul');
    var addComma = false, comma = "";
    for(var i = 0; i < session.length(); ++i) {
      var sp = document.createElement('li');
      sp.onclick = detail_time;
      sp.appendChild(document.createTextNode(format_time(session.at(i).time)));
      sp.id = "t" + i;
      c.appendChild(sp);
    }
    fragment.appendChild(c);
    if(root.lastChild)
      root.replaceChild(fragment, root.lastChild);
    else
      root.appendChild(fragment);
  }
  function highlight(index, length, bracket0, bracket1) {
    var slice = Array.prototype.slice;
    var first = $('session').querySelector('.first');
    if (first) {
      first.classList.remove('first');
    }
    slice.call(document.getElementsByClassName('highlight-solve'), 0).forEach(function(el) {
      el.classList.remove('highlight-solve');
    });
    slice.call(document.getElementsByClassName('bracket'), 0).forEach(function(el) {
      el.classList.remove('bracket');
      el.innerHTML = el.innerHTML.substr(1, el.innerHTML.length - 2);
    });
    var solveStart = $('t' + index);
    solveStart.classList.add('first');
    for(var i = 0; i < length; ++i) {
      solveStart = $('t' + (index + i));
      if (i == bracket0 || i == bracket1) {
        solveStart.classList.add('bracket');
        solveStart.innerHTML = "(" + solveStart.innerHTML + ")";
      }
      solveStart.classList.add('highlight-solve');
    }
  }
  return {
    format: format,
    highlight: highlight
  };
});

module.exports = SessionFormatter;
