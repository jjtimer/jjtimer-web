var format_time = require('./TimeFormatter');
var $ = document.getElementById.bind(document);

var SessionFormatter = (function (Session) {
  function detail_time(ev) {
    var id = parseInt(ev.target.id.substr(1), 10);
    var solve = Session.at(id);
    $('detail').textContent =
        (id + 1) + ". " + format_time(solve.time) + " " + solve.scramble;
    $("detail").classList.toggle("show-detail");
    $("detail").classList.toggle("hide-detail");
  }
  function render(index, length, bracket0, bracket1) {
    var root = $('session'), child = null;
    root.addEventListener('click', detail_time);
    var fragment = document.createDocumentFragment();
    var c = document.createElement('ul');
    for(var i = 0; i < Session.length(); ++i) {
      var sp = document.createElement('li');
      sp.textContent = format_time(Session.at(i).time);
      if (i >= (index) && i <= (index + length)) {
        sp.classList.add('highlight-solve');
      }
      if (i == index) {
        sp.classList.add('first');
      }
      if (i == (index + bracket0) || i == (index + bracket1)) {
        sp.textContent = "(" + sp.textContent + ")";
      }
      sp.id = "t" + i;
      c.appendChild(sp);
    }
    fragment.appendChild(c);
    if(root.lastChild)
      root.replaceChild(fragment, root.lastChild);
    else
      root.appendChild(fragment);
  }
  return {
    render: render
  };
});

module.exports = SessionFormatter;
