var format_time = require('./TimeFormatter');
var $ = document.getElementById.bind(document);

var Event = require('jjtimer-core/src/Event');

var SessionFormatter = function(Session) {
  function detail_time(ev) {
    var id = parseInt(ev.target.id.substr(1), 10);
    var solve = Session.at(id);
    $('detail').innerHTML =
        (id + 1) + ". " + format_time(solve.time) + " " + solve.scramble;
    $("detail").classList.toggle("show-detail");
    $("detail").classList.toggle("hide-detail");
  }

  var SolveBox = React.createClass({
    displayName : 'SolveBox',
    render : function() {
      return React.DOM.li({onClick : detail_time, id : this.props.id},
                          format_time(this.props.time));
    }
  });

  var comp = React.createClass({
    displayName : 'SessionBox',
    getInitialState : function() { return {session : Session}; },
    componentDidMount :
        function() {
          var callback =
              (function(){this.setState({session : Session})}).bind(this);
          Event.on('session/updated', callback);
        },
    render :
        function() {
          var solvelist = [];
          for (var i = 0; i < this.state.session.length(); ++i) {
            solvelist.push(SolveBox({
              time : this.state.session.at(i).time,
              id : 't' + i,
              key : i
            }));
          }
          return (React.DOM.ul({id : "taglist"}, solvelist));
        }
  });
  return {
    render : function() {
      React.renderComponent(comp(null), document.getElementById('session'))
    }
  };
};

module.exports = SessionFormatter;
