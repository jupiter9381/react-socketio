import React from 'react'
import _ from 'lodash';
import moment from 'moment';
import FlexView from 'react-flexview';
import PrintIcon from 'material-ui/svg-icons/action/print';
// import Slider from "react-slick";
// import RaisedButton from 'material-ui/RaisedButton';
import uuid from 'node-uuid';
// import ReactPlayer from 'react-player';
import * as SocketIO from "../common/SocketIO.js";
import * as DataAPI from "../common/DataAPI.js";
import Dialogs from "../common/Dialogs.js";
// import * as history from '../common/history.js';
import constants from "../common/constants";
// import * as raspberry from "../common/raspberry.js";
import ReactToPrint from "../common/reactToPrint.js";
import Sound from "react-sound";
import logo from "../images/company_logo.jpg";
// import { Socket } from 'net';
import utils from '../common/utils';

class ComponentToPrint extends React.Component {
	constructor(props) {
		super();
	}

	render() {
		return (
			<div style={{width: 270}}>
				<div style={{ width: '100%', textAlign: 'center' }}>
					<img style={{ width: 110 }} src={logo} alt="logo" />
				</div>

				<FlexView style={{ marginTop: 4 }}>
					<FlexView column vAlignContent='center' hAlignContent='center' width='100%'>
						<div style={{ 'fontSize': 11 }}>請留意熒光幕上所顯示之輪侯資料</div>
					</FlexView>
				</FlexView>
				<FlexView>
					<FlexView column vAlignContent='center' hAlignContent='center' width='100%'>
						<div style={{ 'fontSize': 8 }}>Please note the queuing info as shown on the LCD
							Display
						</div>
					</FlexView>
				</FlexView>
				<FlexView>
					<FlexView column vAlignContent='center' hAlignContent='center' width='100%'>
						<div style={{ 'fontSize': 60 }}>
							{_.get(this, 'props.ticket.queue.code') + _.get(this, 'props.ticket.ticketNumber')}
						</div>
					</FlexView>
				</FlexView>
				<FlexView style={{ marginTop: 10, textAlign: 'center' }}>
					<FlexView column vAlignContent='center' hAlignContent='center' width='100%'>
						<div style={{ 'fontSize': 11 }}>請各經銷商留意叫號，如編號將到請出納部等侯，如已過5個，請重新按票。謝謝。</div>
					</FlexView>
				</FlexView>
				<FlexView style={{ marginTop: 15 }}>
					<FlexView column vAlignContent='center' hAlignContent='center' width='100%'>
						<div style={{ 'fontSize': 8 }}>
							{
								"Date日期:" + _.get(this, 'props.ticket.createdDate') +
								 " Time時間:" + _.get(this, 'props.ticket.createdTime')
							}
						</div>
					</FlexView>
				</FlexView>
			</div>
		);
	}
}

class Kiosk extends React.Component {
	constructor(props) {
		super();

		this.state = {
			queues: [
			],
			isTicketPrinting: false,
			shouldShowLayer: false,	
			printingJobId: uuid.v4(),
			ticketToPrint: {
				createdDate: moment().format('YYYY-MM-DD'),
				createdTime: moment().format('HH:mm:ss'),
				ticketNumber: "001",
				queue: {code:"B"},
			},
			displayId: _.get(props.match.params, 'id'),
			display: null,
			isJobQueueRunning: false,
			jobQueue: [],
			sound: {
				urls: [],
				urlToPlay: '',
				status: Sound.status.PLAYING,
				position: 0,
				volume: 100, //[0,100]
			},
			player: {
				id: 0,
				urls: [],
				urlToPlay: '',
				volume: 1, // [0,1]
			},
			advMediaTypeToShow: '',
			heartbeatTimer: null,
		};

		this.createTicket = this.createTicket.bind(this);
		this.onBeforeTicketPrint = this.onBeforeTicketPrint.bind(this);
		this.onAfterTicketPrint = this.onAfterTicketPrint.bind(this);
		this.playNextSound = this.playNextSound.bind(this);
		this.playNextVideo = this.playNextVideo.bind(this);
		this.refreshVideoPlayer = this.refreshVideoPlayer.bind(this);
		this.onVideoPlayEnded = this.onVideoPlayEnded.bind(this);
		this.flashQueueTicket = this.flashQueueTicket.bind(this);
		this.execJobQueue = this.execJobQueue.bind(this);

		SocketIO.init();
	}

	async componentWillMount() {
		this.refreshQueueList();
	}

	componentDidMount() {
		
		DataAPI.get('/api/data/queue', {})
			.then(res => {
				this.setState({
					queues: res
				});
			})
			.catch(error => {
				console.error(error);
			})

		SocketIO.on('refresh', () => {
			window.location.reload();
		});
		
		SocketIO.on('newTicket', ({ queue, number, createdAt, printingJobId }) => {
			if (_.size(printingJobId) && printingJobId !== this.state.printingJobId) return false;
		
			const createdDate = utils.getDate(createdAt);
			const createdTime = utils.getTime(createdAt);
			const ticketNumber = utils.formatTicketNumber(number);
		
			this.setState({
				ticketToPrint: {
					queue,
					createdDate,
					createdTime,
					ticketNumber,
				},
			}, () => {
				this.printer.handlePrint();
				this.printer.close();
			});
		});
	
		SocketIO.on('updateKioskLayer', ({ isAllowGetTicket }) => {
			this.setState({
				shouldShowLayer: !isAllowGetTicket,
			});
		});
	
		SocketIO.on('refreshDisplay', ({ displayId }) => {
			this.refreshDisplay();
		});
	
		SocketIO.on('refreshQueue', () => {
			this.refreshQueueList();
		});
	
		SocketIO.on('refresh', () => {
			this.refreshQueueList();
		});
	}

	componentWillUnmount(){
		SocketIO.emit('deviceDisconnect', {type:'kiosk'});
		SocketIO.close();
	}

	pushJobToQueue({ job, shouldExecuteNextJob = true }, cb = constants.emptyFnc) {
		const self = this;

		this.setState((prevState) => {
			let jobQueue = prevState.jobQueue;
			jobQueue.push(job);

			return { jobQueue };
		}, () => {
			if (shouldExecuteNextJob && !self.state.isJobQueueRunning) self.execJobQueue();
			cb();
		});
	}

  	execJobQueue() {
    	if (!_.size(this.state.jobQueue)) {
      		this.setState({ isJobQueueRunning: false });
      		return;
    	}

		let jobQueue = _.concat(this.state.jobQueue);
		const job = jobQueue.shift();

		this.setState({ jobQueue, isJobQueueRunning: true }, () => {
			job(this.execJobQueue);
		});
  	}

	onBeforeTicketPrint() {
		this.setState({
			isTicketPrinting: true,
		});
	}

	onAfterTicketPrint() {
		this.setState({
			isTicketPrinting: false,
		});
	}

	// fetchQueueList() {
	//   DataAPI.get('/api/kiosk/queueList', {}, (err, queues) => {
	//     if (err) return this.dialogs.error(err);
	//
	//     this.setState({
	//       queues,
	//     });
	//   });
	// }

	// refreshDisplay(cb = constants.emptyFnc) {
	//   DataAPI.get('/api/display', {}, (err, display) => {
	//     if (err) return console.error('get display error:', JSON.stringify(err));
	//
	//
	//     this.setState({
	//       display,
	//     }, () => {
	//       this.refreshAdvMediaBlock();
	//       cb();
	//     });
	//   });
	// }

  	refreshQueueList() {
	//   DataAPI.get('/api/display/queueList', {}, (err, queues) => {
	//     if (err) return console.error('get queueList error:', JSON.stringify(err));
	//
	//     queues = _.map(queues, queue => {
	//       return _.assign(queue, {
	//         ticketNumber: this.formatTicketNumber(_.get(queue, 'lastCalledTicket.number')),
	//         counterName: _.get(queue, 'lastCalledTicket.counter.name'),
	//       });
	//     });
	//
	//     this.setState({
	//       queues,
	//     });
	//   });
  	}

	getAdvPosition() {
		return _.cloneDeep(_.find(this.state.display.advPositions, { row: 0 }));
	}

	createTicket(queue) {
		// DataAPI.post(`/api/kiosk/${queue._id}/createTicket`, {
		// 	printingJobId: this.state.printingJobId,
		// }, (err, ticket) => {
		// 	if (err) return this.dialogs.error(err);
		// });

		DataAPI.post(`/api/kiosk/${queue._id}/createTicket`, 
			{
				printingJobId: this.state.printingJobId
			}
		)
		.then(res => {})
		.catch(error => {
			return this.dialogs.error(error);
		})
	}

	refreshAdvMediaBlock() {
		let advMediaTypeToShow = this.state.advMediaTypeToShow === 'photo' ? 'video' : 'photo';
		const advPosition = this.getAdvPosition();

		if (advMediaTypeToShow === 'photo' && !_.size(_.get(advPosition, 'photos', []))) {
			advMediaTypeToShow = 'video';
		}

		if (advMediaTypeToShow === 'video' && !_.size(_.get(advPosition, 'videos', []))) {
			advMediaTypeToShow = 'photo';
		}

		this.setState({
			advMediaTypeToShow,
		}, () => {
			if (advMediaTypeToShow === 'video') this.refreshVideoPlayer();
		});
	}

	updateQueueTicketNumber(ticket) {
		const queues = _.map(_.cloneDeep(this.state.queues), queue => {
			if (ticket.queue._id === queue._id) {
				_.assign(queue, {
					ticketNumber: ticket.ticketNumber,
					counterName: _.get(ticket, 'counter.name'),
				})
			}
			return queue;
		});

		this.setState({
			queues
		});
	}

	createCallingSoundUrls(ticket) {
		const numbersToFindSound = _.chain(ticket.ticketNumber)
			.toString()
			.map(_.toNumber) // split into 1 digit
			.value();

		let soundUrls = ['/audios/' + _.get(_.find(constants.callingSounds, { type: 'ding' }), 'fileName')];

		// Ticket no.
		soundUrls = _.concat(soundUrls, _.map(numbersToFindSound, number => {
			return '/audios/' + _.get(_.find(constants.callingSounds, {
				type: number,
				lang: 'zhHK',
			}), 'fileName');
		}));

		// Counter no.
		soundUrls.push('/audios/' + _.get(_.find(constants.callingSounds, {
			type: 'goToServiceCounter' + ticket.counter.name,
			lang: 'zhHK',
			}), 'fileName'));

		// Ticket no.
		soundUrls = _.concat(soundUrls, _.map(numbersToFindSound, number => {
		return '/audios/' + _.get(_.find(constants.callingSounds, {
			type: number,
			lang: 'en',
		}), 'fileName');
		}));

		// Counter no.
		soundUrls.push('/audios/' + _.get(_.find(constants.callingSounds, {
			type: 'goToServiceCounter' + ticket.counter.name,
			lang: 'en',
		}), 'fileName'));

		if (true) {
			soundUrls = _.map(soundUrls, (url) => {
				return window.location.origin + url;
			});
		}

		return soundUrls;
	}

	playNextSound() {
		let sound = { ...this.state.sound };

		const urls = sound.urls;

		if (!true) {
			const urlToPlay = urls.shift() || '';

			_.assign(sound, {
				urls,
				urlToPlay,
				position: 0,
			});

			setTimeout(() => {
				this.setState({ sound });
			}, 100);
		}

		if (true) {
			// raspberry.playAudio({
			//   urls,
			// });
		}
	}

	flashQueueTicket(queueToFlash, cb = constants.emptyFnc) {
		let callingTimer;
		let count = 0;
		callingTimer = setInterval(() => {
			if (count > 29) {
				clearInterval(callingTimer);
				return cb();
			}

			count++;

			const queues = _.map(_.cloneDeep(this.state.queues), queue => {
				if (queueToFlash._id === queue._id) {
					_.set(queue, 'isCalling', !queue.isCalling);
				}
				return queue;
			});
			this.setState({ queues });
		}, 400);
	}

  	callTicket(ticket) {
    	const sound = {
      		...this.state.sound,
      		urls: this.createCallingSoundUrls(ticket),
      		urlToPlay: '',
    	};

		this.setState({
			sound
		}, this.playNextSound);
  	}

	refreshVideoPlayer() {
		const advPosition = this.getAdvPosition();
		let urls;

		if (true) {
			urls = _.map(advPosition.videos, (video) => {
				return window.location.origin + video.url;
			});
		} else {
			urls = _.map(advPosition.videos, 'url');
		}

		let player = { ...this.state.player, urls, urlToPlay: '' };

		this.setState({ player }, this.playNextVideo);
	}

	playNextVideo() {
		const player = { ...this.state.player };

		player.urlToPlay = player.urls.shift() || '';
		this.setState({ player });

		if (true && _.size(player.urlToPlay)) {
			// raspberry.playVideo({
			//   playerId: player.id,
			//   urls: [player.urlToPlay],
			//   winPositions: {
			//     x1: 533,
			//     y1: 190,
			//     x2: 1920,
			//     y2: 970,
			//   },
			//   volume: 0,
			// });
		}
	}

	onVideoPlayEnded() {
		if (_.size(this.state.player.urls)) {
			this.playNextVideo();
		} else {
			this.refreshAdvMediaBlock();
		}
	}

	render() {
		return (
			<div className="kiosk-container">
				{
					this.state.shouldShowLayer &&
					<div className="layer-block">
						<div className="pause-layer">
							<div>暫停取票</div>
						</div>
					</div>
				}
				<FlexView height={'100%'}>
					<FlexView column>
						<div className="left-block">
							<img src={logo} alt="logo"/>
						</div>
					</FlexView>
					<FlexView column>
						<div className="right-block">
							{
								this.state.isTicketPrinting &&
								<div className="printing-block">
									<PrintIcon className="icon" />
									<div className="text-chi">請取票</div>
									<div className="text-en">Pickup your ticket</div>
								</div>
							}
							<div className="queue-list">
								<div className="queue-header">
									<div className="zhtw-name">請選擇服務類型</div>
									<div className="en-name">Please Select Service</div>
								</div>
								{
									this.state.queues.length > 0 &&
								_.map(this.state.queues, (queue, index) => (
									<div className="queue-item" key={index}
										onClick={this.createTicket.bind(this, queue)}>
									<div className="code">{queue.code}</div>
									<div className="name">
										<div className="zhtw-name">{queue.name.zhTW}</div>
										<div className="en-name">{queue.name.en}</div>
									</div>
									</div>
								))
								}
							</div>
						</div>
					</FlexView>
				</FlexView>
				<Dialogs onInit={dialog => (this.dialogs = dialog)} />
				<ReactToPrint
				onInit={printer => (this.printer = printer)}
				content={() => this.componentRef}
				onBeforePrint={this.onBeforeTicketPrint}
				onAfterPrint={this.onAfterTicketPrint}
				/>
				<ComponentToPrint 
				ticket={this.state.ticketToPrint} 
				style={{ 'display': 'none' }}
				ref={el => (this.componentRef = el)} 
				/>
			</div>
		);
	}
}

export default Kiosk;



// WEBPACK FOOTER //
// client/display/Kiosk.js
