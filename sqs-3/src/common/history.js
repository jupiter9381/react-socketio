function init(history) {
  this.history = history;
}

function isInited() {
  return !!this.history;
}

function push(url, state) {
  this.history.push(url, state);
}

function replace(url, state) {
  this.history.replace(url, state);
}

function getCurrentLocation() {
  return this.history.location.pathname;
}
export { init, isInited, push, replace, getCurrentLocation };


// WEBPACK FOOTER //
// client/common/history.js