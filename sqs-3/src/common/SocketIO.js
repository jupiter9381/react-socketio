import io from 'socket.io-client';
const server = 'http://localhost:8080';

function init() {
	this.socket = io(server);
}

function on(event, cb) {
  this.socket.on(event, cb);
}

function emit(event, msg) {
  this.socket.emit(event, msg);
}

function removeAllListeners(events) {
  this.socket.removeAllListeners(events);
}

function close(){
  this.socket.close();
}
export { init, on, emit, removeAllListeners, close };
