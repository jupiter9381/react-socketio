import React from 'react'
import _ from 'lodash';
// import moment from 'moment';
// import Slider from 'material-ui/Slider';
import FlexView from 'react-flexview';
import FlatButton from 'material-ui/FlatButton';
// import PersonIcon from 'material-ui/svg-icons/social/person';
// import SettingsIcon from 'material-ui/svg-icons/action/settings';
import Drawer from 'material-ui/Drawer';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
// import PowerIcon from 'material-ui/svg-icons/action/power-settings-new';
// import Badge from 'material-ui/Badge';
// import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import VolumeUpIcon from 'material-ui/svg-icons/av/volume-up';
import PrintIcon from 'material-ui/svg-icons/action/print';
// import AddIcon from 'material-ui/svg-icons/content/add';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
// import RemoveIcon from 'material-ui/svg-icons/content/remove';
import DoneIcon from 'material-ui/svg-icons/action/done';
// import { white, amber400 } from 'material-ui/styles/colors';
import * as SocketIO from "../common/SocketIO.js";
import * as DataAPI from "../common/DataAPI.js";
import Dialogs from "../common/Dialogs.js";
// import * as history from '../common/history.js';
// import constants from "../common/constants";
import logo from "../images/lemondice-yellow-transparent.png";
import '../style.css';
import utils from '../common/utils';
// import { Socket } from 'dgram';

// const volumeBarHeight = 110;
// const volumeStep = 10;

class Keypad extends React.Component {
  	constructor(props) {
		super();
		this.state = {
			keypadNumber : _.get(props.match.params, 'padId'),
			ticketsByQueue: [],
			ticketSelected: null,
			isAllowGetTicket: true,
			numberInputted: '',
			ticketStatusToShow: 'pending',
			callingVolume: null,
			isDisableVolumeBtn: false,
			shouldOpenLeftPanel: false,
			counters: [],
			counterSelected: null,
			queues: [

			],
			queueSelected: {"name": {"zhTW": "全部", "en": "whole"},"code":"全部", _id:'total'},
			pendingTickets: [],
			ticketsCalled: [],
			ticketsNoshow: [],
			ticketsWaiting: []
		};

		this.openLeftPanel = this.openLeftPanel.bind(this);
		this.closeLeftPanel = this.closeLeftPanel.bind(this);
		this.selectCounter = this.selectCounter.bind(this);
		this.selectQueue = this.selectQueue.bind(this);
		this.handleTicketsByQueue = this.handleTicketsByQueue.bind(this);
		this.handleCall = this.handleCall.bind(this);
		this.handleComplete = this.handleComplete.bind(this);
		this.handleNoshow = this.handleNoshow.bind(this);
		this.handleWaiting = this.handleWaiting.bind(this);
		this.selectTicketInPending = this.selectTicketInPending.bind(this);
		this.selectTicketInNoshow = this.selectTicketInNoshow.bind(this);
		this.selectTicketInCalledBlock = this.selectTicketInCalledBlock.bind(this);
		this.selectTicketInWaiting = this.selectTicketInWaiting.bind(this);
		this.refreshPage = this.refreshPage.bind(this);
		this.handleNext = this.handleNext.bind(this);
		this.countNumOfCompletedForNoShow = this.countNumOfCompletedForNoShow.bind(this);
		this.noShowToRemove = this.noShowToRemove.bind(this);
		this.assignCounter = this.assignCounter.bind(this);

		SocketIO.init();
  	}

  	openLeftPanel() {
        this.setState({
          	shouldOpenLeftPanel: true
        });
    }

  	closeLeftPanel() {
     	this.setState({
       		shouldOpenLeftPanel: false
		});
   	}

	componentDidMount() {
		DataAPI.get('/api/data/queue', {})
			.then(res => {
				let ab_ids = [];
				let cde_ids = [];
				res.map(ele => {
					if(ele.code === "A" || ele.code === "B") ab_ids.push(ele._id);
					if(ele.code === "C" || ele.code === "D" || ele.code === "E") cde_ids.push(ele._id);
				})
				let queue = [{"name": {"zhTW": "全部", "en": "whole"},"code":"全部", _id:'total'}];
				let abqueue = [{"name": {"zhTW": "A&B", "en": "A/B"},"code":"A & B", _id:"ab", keys: ab_ids}];
				let cdequeue = [{"name": {"zhTW": "C&D&E", "en": "C/D/E"},"code":"C & D & E", _id:"cde", keys: cde_ids}];
				
				this.setState({
					queues: [...queue, ...abqueue, ...cdequeue]
				});
				if(this.state.keypadNumber >= 1 && this.state.keypadNumber <= 10) this.setState({queueSelected: cdequeue[0]});
				if(this.state.keypadNumber >= 11 && this.state.keypadNumber <= 13) this.setState({queueSelected: abqueue[0]});
			})
			.catch(err => {
				console.error(err);
			});

		DataAPI.get('/api/data/counter', {})
			.then(res => {
				res.map(ele => {
					ele.nameCH = '櫃枱' + ele.name;
					ele.name = `counter${ele.name}`;
					return ele;
				});
				this.setState({
					counters: res
				}, (res)=>{

					this.assignCounter();
				});

			})
			.catch(error => {
				console.error(error);
			});
		// Get pending tickets from the server
		this.apiTicketPending();

		// keypad is turned on
		SocketIO.emit('keypadConnect','keyPadconnect');

		// Add a new ticket to the pending tickets.
		// noshow ticket whose counter is over 5 will be removed.
		SocketIO.on('newTicket', (data) => {
			this.apiTicketPending();
			
		});

		// counters are turned on or off
		SocketIO.on('counterChange', data => {
			data.map(item => {
				item.nameCH = '櫃枱' + item.name;
				item.name = 'counter' + item.name;
				return item;
			});
			let counterSelected = this.state.counterSelected;
			if(counterSelected){
				_.map(data, (item, index) => {
					if(item._id === counterSelected._id){
						if(!item.status){
							window.alert(`Counter ${index + 1} is Disconnected. This page will be refreshed.`);
							window.location.reload();
						}
					}
				})
			}

			this.setState({
				counters: data
			});
		});

		//this keypad called one ticket
		SocketIO.on('callTickets', cTicket => {
			var { _id } = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			var pTickets = this.state.pendingTickets;
			var remTickets = _.filter(pTickets, o => {
				return o._id !== _id;
			});
			
			let ticketsByQueue = [];
			
			if(this.state.queueSelected._id === 'total'){
				ticketsByQueue = remTickets
			} else {
				this.state.queueSelected.keys.map(key => {
					ticketsByQueue = [..._.filter(remTickets, o => o.queue._id === key), ...ticketsByQueue];
				})
			}

			this.countNumOfCompletedForNoShow(cTicket.queue.code);
			var prevTicketsCalled = this.state.ticketsCalled;

			this.noShowToRemove(cTicket.queue.code);

			this.setState({
				ticketsCalled: [...prevTicketsCalled, cTicket],
				pendingTickets: remTickets,
				ticketSelected: cTicket
			}, () => {
				// console.log('this tickets called', this.state.ticketsCalled);
				this.handleTicketsByQueue();
			});
		});

		//other keypad called one ticket
		SocketIO.on('callTicketo', cTicket => {
			let { _id } = cTicket;
			let nTicketSelected = this.state.ticketSelected;

			this.countNumOfCompletedForNoShow(cTicket.queue.code);

			if(this.state.ticketSelected){
				if(this.state.ticketSelected._id === _id){
					nTicketSelected = null;
				}
			}
			let pTickets = this.state.pendingTickets;
			let remTickets = _.filter(pTickets, o => {
				return o._id !== _id;
			});

			this.noShowToRemove(cTicket.queue.code);

			this.setState({
				pendingTickets: remTickets,
				ticketSelected: nTicketSelected
			}, () => {
				// console.log('this tickets called', this.state.ticketsCalled);
				this.handleTicketsByQueue();
			});
		});

		//this keypad complete one ticket
		SocketIO.on('completeTickets', data => {
			let cTicket = data.ticket;
			let type = data.type;
			let { _id } = cTicket;

			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let pTickets = this.state.pendingTickets;
			let remTickets = [];
			let nTicketCalled = [];
			let nTicketsWaiting = [];
			if(type === 'pending'){
				remTickets = _.filter(pTickets, o => {
					return o._id !== _id;
				});
				nTicketCalled = [...this.state.ticketsCalled, cTicket];
				nTicketsWaiting = this.state.ticketsWaiting;
				this.countNumOfCompletedForNoShow(cTicket.queue.code);
			} else if(type === 'waiting'){
				let nsTickets = this.state.ticketsWaiting;
				nTicketsWaiting = _.filter(nsTickets, o => {
					return o._id !== _id;
				});
				remTickets = pTickets;
				nTicketCalled = [...this.state.ticketsCalled, cTicket];
			} else {
				remTickets = pTickets;
				nTicketCalled = this.state.ticketsCalled;
				nTicketsWaiting = this.state.ticketsWaiting;
				nTicketCalled.map((item, index) => {

					if(item._id === _id){
						item.status = 'complete';
						item.completedAt = cTicket.completedAt;
					}
					return item;
				});
			}
			if(nTicketCalled.length > 14){
				nTicketCalled = _.tail([...nTicketCalled]);
			}

			this.noShowToRemove(cTicket.queue.code);

			console.log("compllllettted");
			// start handle by tickets (inline)
			this.initTicketsByQueue(remTickets);
			
			// end handle by tickets (inline)
			
			this.setState({
				ticketsCalled: nTicketCalled,
				pendingTickets: remTickets,
				ticketsWaiting: nTicketsWaiting,
			}, () => {
				// console.log('this tickets completed', this.state.ticketsCalled);

			});
		});
		// other ticket complete the ticket
		SocketIO.on('completeTicketo', ({ticket, type}) => {
			console.log("completeTicketttto");
			var cTicket = ticket;

			if(type === 'pending'){
				let { _id } = cTicket;
				let nTicketSelected = this.state.ticketSelected;

				let pTickets = this.state.pendingTickets;
				let remTickets = _.filter(pTickets, o => {
					return o._id !== _id;
				});
				this.countNumOfCompletedForNoShow(cTicket.queue.code);
				this.noShowToRemove(cTicket.queue.code);

				// start handle by tickets (inline)
				let ticketsByQueue = [];
				if(this.state.queueSelected._id === 'total'){
					ticketsByQueue = remTickets
				} else {
					ticketsByQueue = _.filter(remTickets, o => o.queue._id === this.state.queueSelected._id);
				}
				// end handle by tickets (inline)
				if(this.state.ticketSelected){
					if(this.state.ticketSelected._id === _id){
						if(ticketsByQueue.length > 0){
							nTicketSelected = ticketsByQueue[0];
						} else {
							nTicketSelected = null;
						}
					}
				}
				this.setState({
					pendingTickets: remTickets,
					ticketSelected: nTicketSelected,
					ticketsByQueue: ticketsByQueue
				}, () => {
					// console.log('this tickets called', this.state.ticketsCalled);


				});
			} else if(type === 'waiting'){
				let { _id } = cTicket;
				let nTicketSelected = this.state.ticketSelected;
				if(this.state.ticketSelected){
					if(this.state.ticketSelected._id === _id){
						if(this.state.ticketsByQueue.length > 0){
							nTicketSelected = this.state.ticketsByQueue[0];
						} else {
							nTicketSelected = null;
						}
					}
				}
				let pTickets = this.state.ticketsWaiting;
				let remTickets = _.filter(pTickets, o => {
					return o._id !== _id;
				});
				// this.countNumOfCompletedForNoShow(cTicket.queue.code);
				// this.noShowToRemove(cTicket.queue.code);

				this.setState({
					ticketsWaiting: remTickets,
					ticketSelected: nTicketSelected
				}, () => {
					// console.log('this tickets called', this.state.ticketsCalled);
				});
			}
		});

		// ticket status changed called -> noshow
		SocketIO.on('noshowTickets', cTicket => {
			let { _id } = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);

			cTicket.passnum = 0;
			let cTickets = this.state.ticketsCalled;
			let remTickets = _.filter(cTickets, o => {
				return o._id !== _id;
			});
			let ticketSelected = null;
			if(this.state.ticketsByQueue.length>0){
				ticketSelected = this.state.ticketsByQueue[0];
			}
			this.setState({
				ticketsCalled: remTickets,
				ticketsNoshow: [...this.state.ticketsNoshow, cTicket],
				ticketSelected: ticketSelected
			});
		});
		// ticket status changed called -> noshow in the other keypad
		SocketIO.on('called_to_noshow_o', cTicket => {
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			cTicket.passnum = 0;
			this.setState({
				ticketsNoshow: [...this.state.ticketsNoshow, cTicket]
			});
		});
		// ticket status changed noshow -> called
		SocketIO.on('cut_noshowTickets', cTicket => {
			let {_id} = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let nsTickets = this.state.ticketsNoshow;
			let remTickets = _.filter(nsTickets, o => {
				return o._id !== _id;
			});
			let prevTicketsCalled = this.state.ticketsCalled;
			this.setState({
				ticketsCalled: [...prevTicketsCalled, cTicket],
				ticketsNoshow: remTickets,
				ticketSelected: cTicket
			});
		});
		// ticket status changed noshow -> called in other keypad
		SocketIO.on('noshow_to_called_o', cTicket => {
			let {_id} = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let nsTickets = this.state.ticketsNoshow;
			let remTickets = _.filter(nsTickets, o => {
				return o._id !== _id;
			});
			let ticketSelected = this.state.ticketSelected;
			if(ticketSelected!== null){if(this.state.ticketSelected._id === cTicket._id){
				if(this.state.ticketsByQueue.length > 0){
					ticketSelected = this.state.ticketsByQueue[0];
				} else {
					ticketSelected = null;
				}
			}}
			this.setState({
				ticketsNoshow: remTickets,
				ticketSelected: ticketSelected
			});
		});

		// ticket status changed called -> waiting in this keypad
		SocketIO.on('waitingTickets', cTicket => {
			let { _id } = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);

			let cTickets = this.state.ticketsCalled;
			let remTickets = _.filter(cTickets, o => {
				return o._id !== _id;
			});
			let ticketSelected = null;
			if(this.state.ticketsByQueue.length>0){
				ticketSelected = this.state.ticketsByQueue[0];
			}
			this.setState({
				ticketsCalled: remTickets,
				ticketsWaiting: [...this.state.ticketsWaiting, cTicket],
				ticketSelected: ticketSelected
			});
		});

		// ticket status changed called -> waiting in the other keypad
		SocketIO.on('called_to_waiting_o', cTicket => {
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			this.setState({
				ticketsWaiting: [...this.state.ticketsWaiting, cTicket]
			});
		});

		// ticket status changed waiting -> called
		SocketIO.on('cut_waitingTickets', cTicket => {
			let {_id} = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let nsTickets = this.state.ticketsWaiting;
			let remTickets = _.filter(nsTickets, o => {
				return o._id !== _id;
			});
			let prevTicketsCalled = this.state.ticketsCalled;
			this.setState({
				ticketsCalled: [...prevTicketsCalled, cTicket],
				ticketsWaiting: remTickets,
				ticketSelected: cTicket
			});
		});
		// ticket status changed waiting -> called in other keypad
		SocketIO.on('waiting_to_called_o', cTicket => {
			let {_id} = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let nsTickets = this.state.ticketsWaiting;
			let remTickets = _.filter(nsTickets, o => {
				return o._id !== _id;
			});
			let ticketSelected = this.state.ticketSelected;
			if(ticketSelected !== null){if(this.state.ticketSelected._id === cTicket._id){
				if(this.state.ticketsByQueue.length > 0){
					ticketSelected = this.state.ticketsByQueue[0];
				} else {
					ticketSelected = null;
				}
			}}
			this.setState({
				ticketsWaiting: remTickets,
				ticketSelected: ticketSelected
			});
		});



		// ticket status change complete -> called
		SocketIO.on('complete_to_called', cTicket => {
			let {_id} = cTicket;
			cTicket.number = utils.formatTicketNumber(cTicket.number);
			cTicket.createdAtTime = utils.getTime(cTicket.createdAt);
			let nsTickets = this.state.ticketsCalled;
			let remTickets = _.filter(nsTickets, o => {
				return o._id !== _id;
			});

			this.setState({
				ticketsCalled: [...remTickets, cTicket],
				ticketSelected: cTicket
			});
		});

		// ticket status changed noshow->remove in this keypad
		SocketIO.on('remove_noshowTicket_s', ids=> {

			let rTickets = [];
			let iNoShowTickets = this.state.ticketsNoshow;
			let noShowTicketIds = _.map(iNoShowTickets, ticket => {
				return ticket._id
			});
			let rTicketIds = _.difference(noShowTicketIds, ids);

			rTickets = _.map(rTicketIds, id => {
				return _.find(iNoShowTickets, o => {
					return o._id === id
				});
			});
			this.setState({
				ticketsNoshow: rTickets
			});
		});
		// ticket status changed noshow->remove in other keypad
		SocketIO.on('remove_noshowTicket_o', ids=> {

			let rTickets = [];
			let iNoShowTickets = this.state.ticketsNoshow;
			let noShowTicketIds = _.map(iNoShowTickets, ticket => {
				return ticket._id
			});
			let rTicketIds = _.difference(noShowTicketIds, ids);

			rTickets = _.map(rTicketIds, id => {
				return _.find(iNoShowTickets, o => {
					return o._id === id
				});
			});

			this.setState({
				ticketsNoshow: rTickets
			});
		});
		SocketIO.on('refresh', msg => {
			console.log('refreshed');
		});

		//  reset all status
		SocketIO.on('reset', () => {
			this.setState({
				pendingTickets: [],
				ticketsCalled: [],
				ticketsNoshow: [],
				ticketsByQueue: [],
				ticketSelected: null,
				ticketsWaiting: []
			});
		});


	}

	componentWillUnmount(){
		// SocketIO.emit('deviceDisconnect', {type:'keypad'});
		// SocketIO.close();
	}
	
	initTicketsByQueue(res) {
		let ticketsByQueue = [];
		if(this.state.queueSelected._id === 'total'){
			ticketsByQueue = res
		} else {

			this.state.queueSelected.keys.map(key => {
				ticketsByQueue = [..._.filter(res, o => o.queue._id === key), ...ticketsByQueue];
			})
			ticketsByQueue = _.sortBy(ticketsByQueue , [o => parseInt(o.createdAt)])

		}
		let ticketSelected = null;
		if(ticketsByQueue.length > 0){
			ticketSelected = ticketsByQueue[0]
		}

		this.setState({
			ticketsByQueue: ticketsByQueue,
			ticketSelected: ticketSelected,
		});

	}
	// assign keypad to counter
	assignCounter(){
		setTimeout(()=>{
			console.log('assignCounter settimeout');
			let mCounter = this.state.counters[this.state.keypadNumber-1];
			if(mCounter.status){
				console.log('counter is opened');
				let counterSelected = mCounter;
				// when a counter is selected, called tickets, no show tickets are listed in the each blocks.
				DataAPI.post('/api/ticket/noshow', {})
					.then(res=>{
						if(res.length > 0){
							_.map(res, o => {
								o.number = utils.formatTicketNumber(o.number);
								o.createdAtTime = utils.getTime(o.createdAt);
							});
						}
						this.setState({
							counterSelected: counterSelected,
							ticketsNoshow: res
						});
					})
					.catch(err => console.error(err));
				DataAPI.post('/api/ticket/waiting', {})
					.then(res=>{
						if(res.length > 0){
							_.map(res, o => {
								o.number = utils.formatTicketNumber(o.number);
								o.createdAtTime = utils.getTime(o.createdAt);
							});
						}
						this.setState({
							counterSelected: counterSelected,
							ticketsWaiting: res
						});
					})
					.catch(err => console.error(err));
				DataAPI.post('/api/ticket/calledbykeypad', {counterID: counterSelected._id})
					.then(res=>{
						let ticketSelected = this.state.ticketSelected;
						if(res.length > 0){
							_.map(res, o => {
								o.number = utils.formatTicketNumber(o.number);
								o.createdAtTime = utils.getTime(o.createdAt);
							});
							ticketSelected = res.length > 0 ? res[0] : null;
						}
						this.setState({
							ticketsCalled: res,
							ticketSelected : ticketSelected
						});
					})
					.catch(err => console.error(err));

			} else {
				console.log('counter is closed');
				if(!window.confirm('請檢查默認櫃檯連線! 是否改為手動選擇櫃檯')){
					window.location.reload();
				}
			}
		}, 1000);


	}

	countNumOfCompletedForNoShow(code){

		let iNoShowTickets = this.state.ticketsNoshow;
		console.log('code, iNoshowTIckets', code, iNoShowTickets);
		_.map(iNoShowTickets, o => {
			console.log('queue code', o.queue.code);
			if(o.queue.code === code){
				o.passnum = o.passnum + 1;
			}
		});
		this.setState({
			ticketsNoshow: iNoShowTickets
		});
	}
	noShowToRemove(code){
		let eTicketIds = [];
		let rTickets = [];
		let iNoShowTickets = this.state.ticketsNoshow;

		_.map(iNoShowTickets, o => {
			if(o.queue.code === code){
				if(o.passnum > 5){
					eTicketIds.push(o._id);
				} else {
					rTickets.push(o);
				}
			} else {
				rTickets.push(o);
			}
		});
		if(eTicketIds.length > 0){
			SocketIO.emit('remove_noshowTickets', eTicketIds);
		}
		// this.setState({
		// 	ticketsNoshow: rTickets
		// });
	}
	apiTicketPending() {
		DataAPI.get('/api/ticket/pending', {})
			.then(res => {
				res.map(item => {
					item.createdAtTime = utils.getTime(item.createdAt);
					item.number = utils.formatTicketNumber(item.number);
					return item;
				});

				//start inline handle tickets by queue
				let ticketsByQueue = [];
				if(this.state.queueSelected._id === 'total'){
					ticketsByQueue = res
				} else {
					this.state.queueSelected.keys.map(key => {
						ticketsByQueue = [..._.filter(res, o => o.queue._id === key), ...ticketsByQueue];
					})
				}
				ticketsByQueue = _.sortBy(ticketsByQueue, [o => parseInt(o.createdAt)])
				console.log("pending", ticketsByQueue);
				// end inline handle tickets by queue

				let ticketSelected = ticketsByQueue.length > 0 ? ticketsByQueue[0] : null;

				this.setState({
					pendingTickets: res,
					ticketsByQueue: ticketsByQueue,
					ticketSelected: ticketSelected
				});
			})
			.catch(error => {
				console.error(error);
			});
	}
	selectQueue(e){
		let selectedQueue = _.find(this.state.queues, o => o._id === e.target.value);
		let {ticketSelected} = this.state;

		let ticketsByQueue = [];
		if(selectedQueue._id === 'total'){
			ticketsByQueue = this.state.pendingTickets;
		} else {
			selectedQueue.keys.map(key => {
				ticketsByQueue = [..._.filter(this.state.pendingTickets, o => o.queue._id === key), ...ticketsByQueue];
			})
		}

		if(ticketSelected){
			if(ticketSelected.status === 'pending'){
				ticketSelected = ticketsByQueue.length > 0 ? ticketsByQueue[0] : null;
			}
		}

		this.setState({
			queueSelected: selectedQueue,
			ticketSelected: ticketSelected,
			ticketsByQueue: ticketsByQueue
		});
	}

	selectCounter(e){
		let counterSelected = _.find(this.state.counters, o => o._id === e.target.value);
		// when a counter is selected, called tickets, no show tickets are listed in the each blocks.

		let ticketSelected = null;

		DataAPI.post('/api/ticket/noshow', {})
			.then(res=>{
				if(res.length > 0){
					_.map(res, o => {
						o.number = utils.formatTicketNumber(o.number);
						o.createdAtTime = utils.getTime(o.createdAt);
					});
				}
				this.setState({
					counterSelected: counterSelected,
					ticketsNoshow: res
				});
			})
			.catch(err => console.error(err));
		DataAPI.post('/api/ticket/calledbykeypad', {counterID: counterSelected._id})
			.then(res=>{
				if(res.length > 0){
					_.map(res, o => {
						o.number = utils.formatTicketNumber(o.number);
						o.createdAtTime = utils.getTime(o.createdAt);
					});
					ticketSelected = res.length > 0 ? res[0] : null;
				}
				this.setState({
					ticketsCalled: res,
					ticketSelected : ticketSelected
				});
			})
			.catch(err => console.error(err));
	}

	handleTicketsByQueue(){

		if(this.state.queueSelected._id === 'total'){
			this.setState({
				ticketsByQueue : this.state.pendingTickets
			});
		} else {
			let tickets = [];

			this.state.queueSelected.keys.map(key => {
				tickets = [..._.filter(this.state.pendingTickets, o => o.queue._id === key), ...tickets];
			})
			tickets = _.sortBy(tickets, [o => parseInt(o.createdAt)])


			this.setState({
				ticketsByQueue: tickets
			});
		}
	}

	handleCall(){
		// if the ticket is in the pending block, the ticket will be called and status pending->called
		// if the ticket is in the called block, reoutput sound "ticket X000 go to the counter X"
		// if the ticket is in the no show block, ticket status noshow -> called
		let cTicket = this.state.ticketSelected;
		let type = cTicket.status || 'default';
		SocketIO.emit('callTicket', {type:type, counter:this.state.counterSelected, ticket: cTicket});
	}
	handleComplete(){
		let cTicket = this.state.ticketSelected;
		SocketIO.emit('completeTicket', {counter: this.state.counterSelected, ticket: cTicket});
	}
	handleWaiting(){
		let cTicket = this.state.ticketSelected;
		SocketIO.emit('waitingTicket', {counter: this.state.counterSelected, ticket: cTicket});
	}
	handleNoshow(){
		let cTicket = this.state.ticketSelected;
		SocketIO.emit('noshowTicket', {counter: this.state.counterSelected, ticket: cTicket});
	}

	handleNext(){
		let counterSelected = this.state.counterSelected;
		SocketIO.emit('callNext', counterSelected);
	}

	selectTicketInPending(ticket){

		// check if this keypad is connected to the counter
		if(!this.state.counterSelected){
			return;
		}

		// check if this ticket is the first ticket in the queue

		if(this.state.ticketsByQueue[0]._id !== ticket._id){
			return;
		}

		// current seleted ticket status in not "called"
		if(this.state.ticketSelected){
			if(this.state.ticketSelected.status === 'called'){
				return;
			}
		}
		console.log('ticket', ticket);
		this.setState({
			ticketSelected: ticket
		});
	}
	selectTicketInWaiting(ticket){
		if(this.state.ticketSelected){
			if(this.state.ticketSelected.status === 'called'){
				return;
			}
		}
		console.log('ticket', ticket);
		this.setState({
			ticketSelected: ticket
		});
	}

	selectTicketInNoshow(ticket){
		if(this.state.ticketSelected){
			if(this.state.ticketSelected.status === 'called'){
				return;
			}
		}
		console.log('ticket', ticket);
		this.setState({
			ticketSelected: ticket
		});

	}
	selectTicketInCalledBlock(ticket){
		if(this.state.ticketSelected){
			if(this.state.ticketSelected.status === 'called'){
				return;
			}
		}
		console.log('ticket', ticket);
		this.setState({
			ticketSelected: ticket
		});

	}


	checkButtonDisable(type){
		switch(type){
			case 'call':
				if(this.state.ticketSelected){
					return false;
				}
				return true;
			case 'complete':
				if(this.state.ticketSelected){
					switch(this.state.ticketSelected.status){
						case 'noshow':
						case 'complete':
							return true;
						case 'pending':
						case 'called':
						case 'waiting':
							return false;
						default:
							return true;
					}
					// if(this.state.ticketSelected.status != 'noshow'){
					// 	return false;
					// }
					// if( this.state.ticketSelected.status != 'complete'){
					// 	return false;
					// }
				}
				return true;
			case 'noshow':
			case 'waiting':
				if(this.state.ticketSelected){
					if(this.state.ticketSelected.status === 'called'){
						return false;
					}
				}
				return true;
			default:
				return false;
		}
	}

	refreshPage(){
		let mCounter = this.state.counters[this.state.keypadNumber-1];
		console.log('refresh page');
		SocketIO.emit('refresh_counter', mCounter);

		window.location.reload();


	}

  	render() {
    	this.ticketsCalledRefs = {};

		return (
			<div className="keypad-container">
				<Drawer open={this.state.shouldOpenLeftPanel} className="left-panel-block"
					containerClassName="left-panel-container">
					<div className="queue-body-left-block">
						<div className="left-panel-header-block">
							<CloseIcon className="close-icon" onClick={this.closeLeftPanel} />
						</div>
						<FlexView className="function-block">
							<FlexView column>
								<div className="function-left-block">

									<div className="counters-block">
										<div className="title">櫃枱</div>
										<RadioButtonGroup
											name="counters"
											valueSelected={this.state.counterSelected ? _.get(this.state.counterSelected, '_id') : ''}
											onChange={this.selectCounter}
											className="radio-group-block">
											{

												this.state.counters.map((counter, key) => {
													let mColor = counter.status ? '#33a532' : '#d91e19';
													return <RadioButton
														key={key}
														value={counter._id}
														label={counter.nameCH}
														onChange = {(e) => {console.log('onchange', e.target.value)}}
														labelStyle={{ color: mColor, width: '100%' }}
														disabled={!counter.status}
														className="radio-block"
													/>
												})
											}

										</RadioButtonGroup>
									</div>
								</div>
							</FlexView>
						</FlexView>
					</div>
				</Drawer>
				<FlexView className="keypad-header">
					<FlexView column vAlignContent="center" className="logo-block">
						<div>
							<MenuIcon className="menu-icon" onClick={this.openLeftPanel} />
							<img src={logo} alt={'Logo'} onClick={this.refreshPage }/>
						</div>
					</FlexView>
					<FlexView column marginLeft="auto">
						<FlexView className="button-block" vAlignContent="center">
							<h3>{this.state.counterSelected? this.state.counterSelected.nameCH : ''}</h3>
							{/*<FlatButton*/}
							{/*label="設定"*/}
							{/*icon={<SettingsIcon />}*/}
							{/*onClick={this.navigateToAdminPanel}*/}
							{/*/>*/}
							{/*<FlatButton*/}
							{/*label="登出"*/}
							{/*icon={<PowerIcon />}*/}
							{/*/>*/}
						</FlexView>
					</FlexView>
				</FlexView>

				<FlexView className="keypad-body">
					<FlexView column className="keypad-body-block">
						<div className="queue-block">
							<FlexView className="queue-body-block">
								<div className="queue-body-right-block">
									<div className="keypad-upper-block">

										<div className="queues-block">
											<div className="text">隊伍</div>
											<RadioButtonGroup
												name="counters"
												valueSelected={this.state.queueSelected ? _.get(this.state.queueSelected, '_id') : ''}
												onChange={this.selectQueue}
												className="radio-group-block">
												{
													_.map(this.state.queues, (queue, index) => (
														<RadioButton
														key={index}
														value={queue._id}
														label={queue.code}
														labelStyle={{
															color: 'white',
														}}
														className="radio-block"
														/>
													))
												}
											</RadioButtonGroup>
										</div>
										<div className="call-noshow-block">

											<div className="called-tickets-block">
												<div className="title">已叫號</div>
												<div className="tickets-block">
													{

													_.map(_.reverse([...this.state.ticketsCalled]), (ticket, ticketIndex) => (
														<div
															className={(ticket._id === _.get(this.state.ticketSelected, '_id') ? 'ticket-selected ' : '') + 'ticket-block' + (ticket.status === 'complete' ? ' ticket-complete' : '')}
															key={ticketIndex}
															onClick = {this.selectTicketInCalledBlock.bind(this, ticket)}
															>
															{/* // this.selectTicket.bind(this, ticket, constants.emptyFnc)  onClick={} */}
															<div className="ticket-number">
																{
																	ticket.status === 'complete' ?
																		<DoneIcon className="icon" /> :
																		(ticket.status === 'invalid' ?
																			<CloseIcon className="icon" /> :
																			<VolumeUpIcon className="icon" />
																		)
																}
																<span className="hv-icon">{ticket.queue.code + ticket.number}</span>
															</div>
															<div className="ticket-info">
																{/*<div className="ticket-number-of-people">*/}
																{/*<PersonIcon className="icon" />*/}
																{/*<div*/}
																{/*className="number">{ticket.numberOfPeople}</div>*/}
																{/*</div>*/}
																<div className="ticket-created-time">
																	<PrintIcon className="icon" />
																	<div className="time">{ticket.createdAtTime}</div>
																</div>
															</div>
														</div>
													))
													}
												</div>
											</div>
                        {/*New wait*/}
											<div className="noshow-tickets-block">
												<div className="title">等待</div>
												<div className="tickets-block">
                        { this.state.ticketsWaiting &&
                        _.map(this.state.ticketsWaiting, (ticket, ticketIndex) => (
                          <div
                          className={(ticket._id === _.get(this.state.ticketSelected, '_id') ? 'ticket-selected ' : '') + 'ticket-block'}
                          key={ticketIndex}
                          // onClick={this.selectTicket.bind(this, ticket, constants.emptyFnc)}
                          onClick = {this.selectTicketInWaiting.bind(this,ticket)}
                          >
                          <div className="ticket-number">
                            <span>{ticket.queue.code + ticket.number}</span>
                          </div>
                          <div className="ticket-info">
                            <div className="ticket-created-time">
                            <PrintIcon className="icon" />
                            <div className="time">{ticket.createdAtTime}</div>
                            </div>
                          </div>
                          </div>
                        ))
                        }

												</div>
											</div>
                        {/*New wait*/}
										</div>

										<div className="pending-waiting-block">
											<div className="pending-tickets-block">
												<div className="title">輪侯中</div>

												<div className="tickets-block">
													{
													_.map(this.state.ticketsByQueue, (ticket, ticketIndex) => (
														<div
														className={(ticket._id === _.get(this.state.ticketSelected, '_id') ? 'ticket-selected ' : '') + 'ticket-block'}
														key={ticketIndex}
														// onClick={this.selectTicket.bind(this, ticket, constants.emptyFnc)}
														onClick = {this.selectTicketInPending.bind(this,ticket)}
														>
														<div className="ticket-number">
															<span>{ticket.queue.code + ticket.number}</span>
														</div>
														<div className="ticket-info">
															<div className="ticket-created-time">
															<PrintIcon className="icon" />
															<div className="time">{ticket.createdAtTime}</div>
															</div>
														</div>
														</div>
													))
													}
												</div>
											</div>
                      {/*New no Show*/}
											<div className="waiting-tickets-block">
												<div className="title">沒有出現</div>

												<div className="tickets-block">
                        {
                        _.map(this.state.ticketsNoshow, (ticket, ticketIndex) => (
                          <div
                            className={(ticket._id === _.get(this.state.ticketSelected, '_id') ? 'ticket-selected ' : '') + 'ticket-block'}
                            key={ticketIndex}
                            onClick = {this.selectTicketInNoshow.bind(this, ticket)}
                            >
                            {/* // this.selectTicket.bind(this, ticket, constants.emptyFnc)  onClick={} */}
                            <div className="ticket-number">
                              {
                                (ticket.status === 'invalid' ?
                                  <CloseIcon className="icon" /> :
                                  <VolumeUpIcon className="icon" />
                                )
                              }
                              <span className="hv-icon">{ticket.queue.code + ticket.number}</span>
                            </div>
                            <div className="ticket-info">

                              <div className="ticket-created-time">
                                <PrintIcon className="icon" />
                                <div className="time">{ticket.createdAtTime}</div>
                              </div>
                            </div>
                          </div>
                        ))
                        }
												</div>
											</div>
                      {/*New no Show*/}
										</div>

										<div className="result-button-block">
										<FlatButton
											label="叫號"
											icon={<VolumeUpIcon className="icon" />}
											disabled = {this.checkButtonDisable('call')}
											onClick={this.handleCall}
										/>
										<FlatButton
											label="完成"
											icon={<DoneIcon className="icon" />}
											disabled = {this.checkButtonDisable('complete')}
											onClick = {this.handleComplete}
										/>
										<FlatButton
											label="等待"
											icon={<DoneIcon className="icon" />}
											disabled = {this.checkButtonDisable('waiting')}
											onClick = {this.handleWaiting}
										/>
										<FlatButton
											label="沒有出現"
											icon={<CloseIcon className="icon" />}
											disabled = {this.checkButtonDisable('noshow')}
											onClick = {this.handleNoshow}
										/>
										<FlatButton
											label="下一位"
											disabled = {!this.state.counterSelected}
											onClick = {this.handleNext}
										/>
									</div>
									</div>
								</div>
							</FlexView>
						</div>
					</FlexView>
				</FlexView>
			<Dialogs onInit={dialog => (this.dialogs = dialog)} />
		</div>
		);
  }
}

export default Keypad;
