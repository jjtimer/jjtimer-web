var format_time = require('./TimeFormatter');
var $ = document.getElementById.bind(document);

var SessionFormatter = (function () {
  var clickFn;
  function detail_time(session, ev) {
    var id = parseInt(ev.target.id.substr(1), 10);
    var solve = session.at(id);
    $('detail').textContent =
        (id + 1) + ". " + format_time(solve.time) + " " + solve.scramble;
    $("detail").classList.toggle("show-detail");
    $("detail").classList.toggle("hide-detail");
  }
  function render(session, index, length, bracket0, bracket1) {
    var root = $('session');
    // Clear the previous listener here, since we bind detail_time to a new
    // session each time.
    root.removeEventListener('click', clickFn);
    clickFn = detail_time.bind(null, session);
    root.addEventListener('click', clickFn);
    var fragment = document.createDocumentFragment();
    var ul = document.createElement('ul');
    for(var i = 0; i < session.length(); ++i) {
      var li = document.createElement('li');
      li.textContent = format_time(session.at(i).time);
      if (i >= (index) && i < (index + length)) {
        li.classList.add('highlight-solve');
      }
      if (i == index) {
        li.classList.add('first');
      }
      if (i == (index + bracket0) || i == (index + bracket1)) {
        li.textContent = "(" + li.textContent + ")";
      }
      li.id = "t" + i;
      ul.appendChild(li);
    }
    fragment.appendChild(ul);
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
