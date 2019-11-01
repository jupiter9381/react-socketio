import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import FlexView from 'react-flexview';
// import PersonIcon from 'material-ui/svg-icons/social/person';
// import ReactPlayer from 'react-player';
// import Slider from "react-slick";
import Sound from 'react-sound';
import _ from 'lodash';
import constants from "../common/constants.js";
import testsound from "../audios/0_en.wav"
import testsound2 from "../audios/C.wav"
import * as SocketIO from '../common/SocketIO';
import * as DataAPI from '../common/DataAPI';
import utils from '../common/utils';
// const NUMBER_OF_PHOTO_BLOCK = 5;
import logo from '../images/company-logo.png';

import SoundBox from './soundBox';

class Landscape extends Component {
	constructor(props) {
		super();

		this.state = {
			ts: [testsound2, testsound],
			displayId: _.get(props.match.params, 'id'),
			display: null,
			isJobQueueRunning: false,
			jobQueue: [],
			queues: [],
			sound: {
				urls: [],
				urlToPlay: '',
				// status: Sound.status.PLAYING,
				status: Sound.status.PAUSED,
				position: 1,
				volume: 100, //[0,100]
			},
			player: {
				id: 0,
				urls: [],
				urlToPlay: '',
				volume: 0, // [0,1]
			},

			advMediaTypeToShow: '',
			heartbeatTimer: null,
			tickets: [],
			ticketsCustomer: [],
			ticketsLeftCustomer: [],
			ticketsRightCustomer: [],
			ticketsGeneral: [],
			comingTicketAs: [],
			comingTicketBs: [],
			comingTicketCs: [],
			comingTicketDs: [],
			comingTicketEs: [],
			comingTicketABs: [],
			comingTicketCDEs: [],
			completedTicketAs: [],
			completedTicketBs: [],
			completedTicketCs: [],
			completedTicketDs: [],
			completedTicketEs: [],
			isCalling: false,
			remarkText: '請各經銷商留意叫號，如編號將到請出納部等侯，如已過5個，請重新按票。謝謝。'
		};
		this.playNextSound = this.playNextSound.bind(this);
		this.soundPlay = this.soundPlay.bind(this);
		this.outputSound = this.outputSound.bind(this);
		SocketIO.init();
		this.ticketsForSound = [];
		this.supportSoundbox = false;

		this.queueA = null;
		this.queueB = null;
		this.queueC = null;
		this.queueD = null;
		this.queueE = null;
	}


	componentDidMount() {
		//get tickets from the db (pending, called)
		this.apiTicketCalled();

		DataAPI.get('/api/data/queue', {})
			.then(res => {
				this.queueA = _.find(res, queue => {
					return queue.code === 'A';
				});
				this.queueB = _.find(res, queue => {
					return queue.code === 'B';
				});
				this.queueC = _.find(res, queue => {
					return queue.code === 'C';
				});
				this.queueD = _.find(res, queue => {
					return queue.code === 'D';
				});
				this.queueE = _.find(res, queue => {
					return queue.code === 'E';
				});
				this.apiTicketComing();

				DataAPI.get('/api/ticket/completedTickets', {})
					.then(tickets => {
						_.map(tickets, o => {
							if (o.tickets.length > 0) {
								_.map(o.tickets, ticket => {
									ticket.number = utils.formatTicketNumber(ticket.number);
								})
							}
						})
						var completedTicketAs = _.find(tickets, o => {
							return o._id === this.queueA._id;
						});
						var completedTicketBs = _.find(tickets, o => {
							return o._id === this.queueB._id;
						});
						var completedTicketCs = _.find(tickets, o => {
							return o._id === this.queueC._id;
						});
						var completedTicketDs = _.find(tickets, o => {
							return o._id === this.queueD._id;
						});
						var completedTicketEs = _.find(tickets, o => {
							return o._id === this.queueE._id;
						});
						this.setState({
							completedTicketAs, completedTicketBs, completedTicketCs, completedTicketDs, completedTicketEs
						});
					});

			})
			.catch(error => {
				console.error(error);
			});

		SocketIO.on('serverstart', (msg) => {
			console.log('server is start');
			window.location.reload();
		});

		SocketIO.on('newTicket', (data) => {
			this.apiTicketComing();
		});
		SocketIO.on('callTicketo', (ticket) => {
			ticket.number = utils.formatTicketNumber(ticket.number);
			this.setState({
				tickets: [...this.state.tickets, ticket]
			}, () => {
				// do sound output
				this.outputSound({ ticket: ticket, type: 'ticketcall' });
				this.apiTicketCalled();
				this.apiTicketComing();
				
			});

		});

		SocketIO.on('called_to_called_o', (ticket) => {
			ticket.number = utils.formatTicketNumber(ticket.number);
			// do sound output
			this.outputSound({ ticket: ticket, type: 'ticketcall' });
		});

		SocketIO.on('noshow_to_called_o', (ticket) => {
			ticket.number = utils.formatTicketNumber(ticket.number);
			this.setState({
				tickets: [...this.state.tickets, ticket]
			}, () => {
				// do sound output
				this.outputSound({ ticket: ticket, type: 'ticketcall' });
				this.apiTicketCalled();
				this.apiTicketComing();
			});
		});
		SocketIO.on('waiting_to_called_o', (ticket) => {
			ticket.number = utils.formatTicketNumber(ticket.number);
			this.setState({
				tickets: [...this.state.tickets, ticket]
			}, () => {
				// do sound output
				this.outputSound({ ticket: ticket, type: 'ticketcall' });
				this.apiTicketCalled();
				this.apiTicketComing();
			});
		});
		SocketIO.on('complete_to_called_o', (ticket) => {
			ticket.number = utils.formatTicketNumber(ticket.number);
			this.setState({
				tickets: [...this.state.tickets, ticket]
			}, () => {
				// do sound output
				this.outputSound({ ticket: ticket, type: 'ticketcall' });
				this.apiTicketCalled();
				this.apiTicketComing();
			});
		});

		SocketIO.on('called_to_noshow_o', (ticket) => {
			let prevTickets = this.state.tickets;

			let newTickets = _.filter(prevTickets, o => {
				return o._id !== ticket._id;
			});
			this.setState({
				tickets: newTickets
			});
			this.apiTicketCalled();
			this.apiTicketComing();
		});
		SocketIO.on('called_to_waiting_o', (ticket) => {
			let prevTickets = this.state.tickets;

			let newTickets = _.filter(prevTickets, o => {
				return o._id !== ticket._id;
			});
			this.setState({
				tickets: newTickets
			});
			this.apiTicketCalled();
			this.apiTicketComing();
		});

		SocketIO.on('completeTicketo', ({ ticket, type }) => {
			let prevTickets = this.state.tickets;
			if (type = 'called') {
				let newTickets = _.filter(prevTickets, o => {
					return o._id !== ticket._id; 
				});
				this.setState({
					tickets: newTickets
				});
				this.apiTicketCalled();
				this.apiTicketComing();
			}
		});

		SocketIO.on('callNext', counter => {
			this.outputSound({ counter: counter, type: 'callNext' });
		});

		//  reset all status
		SocketIO.on('reset', () => {
			this.setState({
				tickets: [],
				comingTicketAs: [],
				comingTicketBs: [],
				comingTicketCs: [],
				completedTicketAs: [],
				completedTicketBs: [],
				completedTicketCs: [],
				completedTicketDs: [],
				completedTicketEs: [],
			});
		});

		// get pending tickets group by queue code, sort by createdAt, limit 5
		SocketIO.on('pendingTickets', tickets => {
			console.log('pending tickets group by ...', tickets);
			_.map(tickets, o => {
				if (o.tickets.length > 0) {
					_.map(o.tickets, ticket => {
						ticket.number = utils.formatTicketNumber(ticket.number);
					})
				}
			})
			var comingTicketAs = _.find(tickets, o => {
				return o._id === this.queueA._id;
			});
			var comingTicketBs = _.find(tickets, o => {
				return o._id === this.queueB._id;
			});
			var comingTicketCs = _.find(tickets, o => {
				return o._id === this.queueC._id;
			});


			let ABisNull = false;
			try{	
				var temp = [comingTicketAs.tickets, comingTicketBs.tickets ]
									const a = temp[0];
									const b = temp[1];
			
									var ab = a.concat(b)
									var comingTicketABs = ab.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
									for (var i = 0; i < comingTicketABs.length; i++) {
										if (comingTicketABs[i].queue === this.queueA._id) {
											comingTicketABs[i].queue = "A"
										}
										else {
											comingTicketABs[i].queue = "B"
										}
									}
								}catch(err){
										ABisNull =true;
									}
			if(ABisNull)
			{
				var comingTicketABs ;
				try{comingTicketABs=comingTicketAs;}catch(err){
					console.log(comingTicketAs)
				}
				try{comingTicketABs=comingTicketBs;}catch(err){
					console.log(comingTicketBs)
				}
			}
			
			this.setState({
				comingTicketAs, comingTicketBs, comingTicketCs, comingTicketABs
			});
		});
		// get completed tickets group by queue code, sort by createdAt, limit 5
		SocketIO.on('completeTicketToLandscape', tickets => {
			
			_.map(tickets, o => {
				if (o.tickets.length > 0) {
					_.map(o.tickets, ticket => {
						ticket.number = utils.formatTicketNumber(ticket.number);
					})
				}
			})
			var completedTicketAs = _.find(tickets, o => {
				return o._id === this.queueA._id;
			});
			var completedTicketBs = _.find(tickets, o => {
				return o._id === this.queueB._id;
			});
			var completedTicketCs = _.find(tickets, o => {
				return o._id === this.queueC._id;
			});

			this.setState({
				completedTicketAs, completedTicketBs, completedTicketCs
			});
		});
	}

	// 
	apiTicketComing() {
		console.log("apiTicketComing");
		DataAPI.get('/api/ticket/comingTickets', {})
			.then(tickets => {
				_.map(tickets, o => {
					if (o.tickets.length > 0) {
						_.map(o.tickets, ticket => {
							ticket.number = utils.formatTicketNumber(ticket.number);
						})
					}
				})
				var comingTicketAs = _.find(tickets, o => {
					return o._id === this.queueA._id;
				});
				var comingTicketBs = _.find(tickets, o => {
					return o._id === this.queueB._id;
				});
				var comingTicketCs = _.find(tickets, o => {
					return o._id === this.queueC._id;
				});
				var comingTicketDs = _.find(tickets, o => {
					return o._id === this.queueD._id;
				});
				var comingTicketEs = _.find(tickets, o => {
					return o._id === this.queueE._id;
				});
				
			var comingTicketABs;
			var comingTicketCDEs;
			try{	
				var temp = [comingTicketAs.tickets, comingTicketBs.tickets ]
				const a = temp[0];
				const b = temp[1];

				var ab = a.concat(b)
				comingTicketABs = ab.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
				for (var i = 0; i < comingTicketABs.length; i++) {
					if (comingTicketABs[i].queue === this.queueA._id) {
						comingTicketABs[i].queue = "A"
					}
					else {
						comingTicketABs[i].queue = "B"
					}
				}
				
			}catch(err){
				
				try{ 
					comingTicketABs=comingTicketAs.tickets
					
					for (var i = 0; i < comingTicketABs.length; i++) {
						if (comingTicketABs[i].queue === this.queueA._id) {
							comingTicketABs[i].queue = "A"
						}
						else {
							comingTicketABs[i].queue = "B"
						}
					}
				}catch(err1){
					console.log(comingTicketABs)
				}
				try{
					comingTicketABs=comingTicketBs.tickets;
					for (var i = 0; i < comingTicketABs.length; i++) {
						if (comingTicketABs[i].queue === this.queueA._id) {
							comingTicketABs[i].queue = "A"
						}
						else {
							comingTicketABs[i].queue = "B"
						}
					}
				}catch(err2){
					console.log(comingTicketABs)
				}
			}
			if(comingTicketCs == undefined) comingTicketCs = {tickets: []};
			if(comingTicketDs == undefined) comingTicketDs = {tickets: []};
			if(comingTicketEs == undefined) comingTicketEs = {tickets: []};

			var temp = [comingTicketCs.tickets, comingTicketDs.tickets, comingTicketEs.tickets ]
			const c = temp[0];
			const d = temp[1];
			const e = temp[2];

			var cde = c.concat(d).concat(e);
			comingTicketCDEs = cde.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
			for (var i = 0; i < comingTicketCDEs.length; i++) {
				if (comingTicketCDEs[i].queue === this.queueC._id) {
					comingTicketCDEs[i].queue = "C"
				} else if(comingTicketCDEs[i].queue === this.queueD._id) {
					comingTicketCDEs[i].queue = "D"
				} else {
					comingTicketCDEs[i].queue = "E"
				}
			}
			this.setState({
				comingTicketAs, comingTicketBs, comingTicketCs, comingTicketABs, comingTicketCDEs
			}, function(){
				console.log("ticketAB",this.state.comingTicketABs);
				console.log("ticketCDE", this.state.comingTicketCDEs);
			});
		});
		this.setState({
			comingTicketABs: this.comingTicketABs,
			comingTicketCDEs: this.comingTicketCDEs
		});
	}
	// 
	apiTicketCalled() {
		DataAPI.get('/api/ticket/called')
			.then(res => {

				res.map((ticket, index) => {
					ticket.number = utils.formatTicketNumber(ticket.number);
					return ticket;
				});
				this.setState({ticketsGeneral: _.filter(res, o => {
					return o.queue.code === "A" || o.queue.code === "B"
				})}); 
				this.setState({ticketsCustomer: _.filter(res, o => {
					return o.queue.code === "C" || o.queue.code === "D" || o.queue.code === "E"
				})}, function(){
					this.setState({ticketsCustomer:_.sortBy([...this.state.ticketsCustomer], [o => parseInt(o.counter.name)])}, function(){
						
					console.log(this.state.ticketsCustomer.slice(0, 5));
						this.setState({ticketsLeftCustomer: this.state.ticketsCustomer.slice(0, 5)});
						this.setState({ticketsRightCustomer: this.state.ticketsCustomer.slice(5, 10)}, function(){
						});
					});
				}); 

			})
			.catch(err => {
				console.error(err);
			});
	}
	soundPlay() {
		this.callSound(this.ticketsForSound[0]);
	}

	outputSound({ ticket, type, counter }) {
		switch (type) {
			case 'ticketcall':
				ticket.number = utils.formatTicketNumber(ticket.number);
				let oTicketsForSound = this.ticketsForSound;
				this.ticketsForSound.push({ type: 'ticket', content: ticket });
				break;
			case 'callNext':
				this.ticketsForSound.push({ type: 'nextCall', content: counter });
				break;
			// default:
			// 	break;
		}


		if (this.ticketsForSound.length > 1) {
			console.info('soundinformation', 'There is already sound playing');
		} else {
			console.info('soundinfomation', 'there is no sound so i will start');
			this.soundPlay();
		}
	}
	playNextSound() {
		let sound = { ...this.state.sound };

		const urls = sound.urls;
		var urlToPlay = urls.shift() || '';

		_.assign(sound, {
			urls,
			urlToPlay,
			position: 0,
		});

		this.supportSoundbox = !this.supportSoundbox;


		if (urlToPlay === '') { // current ticket calling is over.
			// console.log('Current Sound is over');
			// check if there is other tickets to call and output sounds
			let ticketsForSound = this.ticketsForSound;

			let tt = ticketsForSound.shift();
			if (ticketsForSound.length > 0) {
				// there is other tickets to call
				setTimeout(() => {
					this.ticketsForSound = ticketsForSound;

					this.soundPlay();
				}, 1000);

			} else {
				// there is no ticket left.
				// console.log('there is no tickets to call');
				setTimeout(() => {
					this.setState({ sound });
				}, 100);
			}


		} else {
			setTimeout(() => {
				this.setState({ sound });
			}, 100);
		}
	}

	callSound({ type, content }) {
		let urls = [];
		if (type === 'ticket') {

			urls = this.createCallingSoundUrls(content);

		} else {
			urls = this.createCallingNextSoundUrls(content);
		}
		const sound = {
			...this.state.dound,
			urls: urls,
			urlToPlay: '',
			status: Sound.status.PLAYING
		}
		// console.log('sound', sound);
		this.setState({
			sound
		}, this.playNextSound);
	}

	createCallingSoundUrls(ticket) {
		const numbersToFindSound = _.chain(ticket.number)
			.toString()
			.map(_.toNumber) // split into 1 digit
			.value();
		// let soundUrls = ['/audios/' + _.get(_.find(constants.callingSounds, { type: 'ding' }), 'fileName')];
		let soundUrls = [_.get(_.find(constants.callingSounds, { type: 'ding' }), 'fileName')];

		// Code
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: ticket.queue.code,
			lang: 'zhHK',
		}), 'fileName'));

		// Ticket no.
		soundUrls = _.concat(soundUrls, _.map(numbersToFindSound, number => {
			return _.get(_.find(constants.callingSounds, {
				type: number,
				lang: 'zhHK',
			}), 'fileName');
		}));

		// Counter no.
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: 'counter' + ticket.counter.name,
			lang: 'zhHK',
		}), 'fileName'));

		// Code
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: ticket.queue.code,
			lang: 'zhCN',
		}), 'fileName'));

		// Ticket no.
		soundUrls = _.concat(soundUrls, _.map(numbersToFindSound, number => {
			return _.get(_.find(constants.callingSounds, {
				type: number,
				lang: 'zhCN',
			}), 'fileName');
		}));

		// Counter no.
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: 'counter' + ticket.counter.name,
			lang: 'zhCN',
		}), 'fileName'));

		// if (IS_RASPBERRY) {
		//   soundUrls = _.map(soundUrls, (url) => {
		//     return window.location.origin + url;
		//   });
		// }
		// console.log('soundUrls:', soundUrls);
		return soundUrls;
	}
	createCallingNextSoundUrls(counter) {
		let soundUrls = [_.get(_.find(constants.callingSounds, { type: 'ding' }), 'fileName')];
		
		// counter
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: counter.name,
			lang: 'zhHK',
		}), 'fileName'));
		soundUrls.push(_.get(_.find(constants.callingSounds, {
			type: counter.name,
			lang: 'zhCN',
		}), 'fileName'));

		return soundUrls;
	}

	componentWillUnmount() {
		SocketIO.emit('deviceDisconnect', { type: 'landscape' });
		SocketIO.close();
	}

	render() {
		return (
			<div>
				<div className="landscape-block">
					<div className="header-block">
						<div className="name" onClick={this.soundPlay}>Francine</div>
						<div className="img"><img src={logo} alt={'logo'}></img></div>
					</div>
					<div className="body-block">

						<div className="queue-block">
							<FlexView className="queue-header-block">
								<FlexView column>
									<div className="queue-row ">
										客戶櫃枱服務A/B
									</div>
								</FlexView>
							</FlexView>
							<FlexView>
								<FlexView column>
									<div className="queue-row left-block">
										<div className="chi-name">號碼</div>
										<div className="en-name">Number</div>
									</div>
								</FlexView>
								<FlexView column>
									<div className="queue-row right-block">
										<div className="chi-name">櫃枱</div>
										<div className="en-name">Counter</div>
									</div>
								</FlexView>
								<FlexView column>
									<div className="queue-row pending-block">
										<div className="chi-name">請準備</div>
										<div className="en-name">Coming</div>
									</div>
								</FlexView>
							</FlexView>
							{
								_.map(_.sortBy([...this.state.ticketsGeneral], [o => o.counter.name]), (ticket, index) => (
									<FlexView
										className={(this.state.isCalling && index === 0 ? 'calling ' : '') + 'queue-row-block'}
										key={index}>
										{
											<FlexView hAlignContent='left'>
												<div className="queue-row left-block">
													 <div className="info-text">{ticket.queue.code + ticket.number}</div>
												</div>

											</FlexView>
										}

										{
											<FlexView column>
												<div className="queue-row right-block">
													<div className="info-text">{_.get(ticket.counter, 'name', '-')}</div>
												</div>
											</FlexView>}


										{/* { <FlexView column>
											<div className="queue-row right-block lines">
												</div>
											</FlexView> } */}

										{index < 6 &&
											<FlexView hAlignContent='right'>
												<div className="queue-row right-block comings">
													{_.map((this.state.comingTicketABs), (k, i) => (index === i && <div className="info-text" key={i}>{this.state.comingTicketABs[i].queue}{this.state.comingTicketABs[i].number}</div>))} 
												</div>
											</FlexView>
										}
										
									</FlexView>
								))
							}
							<FlexView className="queue-row-block">
								<FlexView hAlignContent='left'>
									<div className="queue-row left-block">
									</div>
								</FlexView>
								<FlexView column>
									<div className="queue-row right-block">
									</div>
								</FlexView>
								<FlexView hAlignContent='right'>
									<div className="queue-row right-block comings">
									{_.map((this.state.comingTicketABs), (k, i) => (this.state.ticketsGeneral.length <= i && <div className="info-text" key={i}>{this.state.comingTicketABs[i].queue}{this.state.comingTicketABs[i].number}</div>))} 
									</div>
								</FlexView>
							</FlexView>
							
							{/* <FlexView hAlignContent='right'>
												<div className="queue-row right-block">
											{_.map((this.state.comingTicketABs),(k,i)=> (<div className="info-text" key={i}>{i}</div>))}
												</div>
											</FlexView> */}
							
						</div>

						<div className="queue-history">
							<FlexView className="queue-header-block">
								<FlexView column>
									<div className="queue-row normal-counter">
										一般服務櫃枱 C / D / E
									</div>
								</FlexView>
							</FlexView>
							<FlexView className="queue-subheader-block">
								<FlexView column>
									<div className="queue-row">
										<div className="queue-completed">
											<div className="chi-name">號碼</div>
											<div className="en-name">Number</div>
										</div>
										<div className="queue-coming">
											<div className="chi-name">櫃枱</div>
											<div className="en-name">Counter</div>
										</div>
									</div>
								</FlexView>
								<FlexView column>
									<div className="queue-row">
										<div className="queue-completed">
											<div className="chi-name">號碼</div>
											<div className="en-name">Number</div>
										</div>
										<div className="queue-coming">
											<div className="chi-name">櫃枱</div>
											<div className="en-name">Counter</div>
										</div>
									</div>
								</FlexView>

								{/* <FlexView column>
									<div className="queue-row">
										<div className="queue-completed">
											<div className="chi-name"> </div>
											<div className="en-name"> </div>
										</div>
										<div className="queue-coming">
											<div className="chi-name"> </div>
											<div className="en-name"> </div>
										</div>
									</div>
								</FlexView> */}

								<FlexView column>
									<div className="queue-row">
										<div className="queue-completed">
											<div className="chi-name">請準備</div>
											<div className="en-name">Coming</div>
										</div>
										<div className="queue-completed">
											<div className="chi-name"> </div>
											<div className="en-name"> </div>
										</div>
									</div>
								</FlexView>
							</FlexView>
							<FlexView className="queue-history-ticket-blocks">
								{/* <FlexView column className="queue-history-ticket-block">
									{// Queue- A - CommingTickets
										_.map( _.chunk(this.state.ticketsCustomer, 5)[0], (ticket, index) => (
											<FlexView key={index} className="text-center">
												{(ticket.counter.name === "1" || ticket.counter.name === "2" || ticket.counter.name === "3" || ticket.counter.name === "4" || ticket.counter.name === "5") &&
													<div className="info-text-history-cNo">{_.get(ticket.counter, 'name', '-')}</div> ||
													<div className="info-text-history"> </div>
												}
											</FlexView>
										))
									}

								</FlexView> */}
								 <FlexView column className="queue-history-ticket-block">
									{// Queue- B - CompletedTickets
										_.map(this.state.ticketsLeftCustomer, (ticket, index) => (
											<FlexView key={index} className="text-center">
												<div className="info-text-history">{ticket.queue.code + ticket.number}</div> 
											</FlexView>
										))
									}
								</FlexView>
								<FlexView column className="queue-history-ticket-block">
									{// Queue- B - CommingTickets
										_.map(this.state.ticketsLeftCustomer, (ticket, index) => (
											<FlexView key={index} className="text-center">
												<div className="info-text-history-cNo">{_.get(ticket.counter, 'name', '-')}</div> 
											</FlexView>
										))
									}
								</FlexView> 
								<FlexView column className="queue-history-ticket-block">
									{// Queue- B - CompletedTickets
										_.map(this.state.ticketsRightCustomer, (ticket, index) => (
											<FlexView key={index} className="text-center">
													<div className="info-text-history">{ticket.queue.code + ticket.number}</div> 
											</FlexView>
										))
									}
								</FlexView>
								<FlexView column className="queue-history-ticket-block">
									{// Queue- B - CommingTickets
										_.map(this.state.ticketsRightCustomer, (ticket, index) => (
											<FlexView key={index} className="text-center">
													<div className="info-text-history-cNo">{_.get(ticket.counter, 'name', '-')}</div>
											</FlexView>
										))
									}
								</FlexView>
								{/* <FlexView column className="queue-history-ticket-block">
									{// Queue- C - CompletedTickets
										this.state.completedTicketCs &&
										_.map(this.state.completedTicketCs.tickets, (ticket, index) => (
											<FlexView key={index} className="text-center">
												<div className="info-text-history">C{ticket.number}</div>
											</FlexView>
										))
									}
								</FlexView> */}
								
								<FlexView column className="queue-history-ticket-block">
									{// Queue- C - CommingTickets
										this.state.comingTicketCDEs &&
										_.map(this.state.comingTicketCDEs.slice(0, 6), (ticket, index) => (
											<FlexView key={index} className="text-center">
												<div className="info-text-history">{ticket.queue}{ticket.number}</div>
											</FlexView>
										))
									}
								</FlexView>
							</FlexView> 


 
						</div>

					</div>
					<FlexView className="bottom-block">
						<FlexView column className="left-block">
							{/* <div class="marquee">
								<span>{this.state.remarkText}</span>
							</div> */}
							<marquee>
								<span>{this.state.remarkText}</span>
							</marquee>
						</FlexView>
					</FlexView>
				</div>

				<SoundBox
					url={this.state.sound.urlToPlay}
					check={this.supportSoundbox}
					playStatus={this.state.sound.status}
					playFromPosition={this.state.sound.position}
					volume={this.state.sound.volume}
					onFinishedPlaying={this.playNextSound}
				/>
			</div>
		)
	}

}

export default withRouter(Landscape);


// WEBPACK FOOTER //
// client/display/Landscape.js
