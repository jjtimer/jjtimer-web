var cancelAnimationFrame =
    window.cancelAnimationFrame || window.webkitCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame || window.clearTimeout;

module.exports = cancelAnimationFrame;
