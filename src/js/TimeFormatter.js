module.exports = function(time) {
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
