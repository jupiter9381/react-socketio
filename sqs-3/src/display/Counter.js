import React, { Component } from 'react';
import { withRouter} from 'react-router-dom'
// import FlexView from 'react-flexview';
// import PersonIcon from 'material-ui/svg-icons/social/person';
// import ReactPlayer from 'react-player';
// import Slider from "react-slick";
// import Sound from 'react-sound';
import _ from 'lodash';

import campanylogo from '../images/company-logo.png';

// import constants from "../common/constants.js";
import * as DataAPI from "../common/DataAPI.js";
import * as SocketIO from "../common/SocketIO.js";
// import { Socket } from 'net';
import utils from '../common/utils';
// import { Socket } from 'dgram';
// const NUMBER_OF_PHOTO_BLOCK = 5;

class Counter extends Component {
    constructor(props) {
		super();

		this.state = {
			counterId: _.get(props.match.params, 'counterId'),
			counter: null,
			display: null,
			isJobQueueRunning: false,
			jobQueue: [],
			heartbeatTimer: null,
			callingTimer: null,
			isCalling: false,
			ticket: {
				queue:{
					code: ''
				},
				number: ''
			}
		};

		SocketIO.init();
		
	}
	
	componentDidMount() {
		// get the counter info with counterId from the db
		DataAPI.get(`/api/data/counter/${this.state.counterId}`, {})
			.then(res=> {
				this.setState({
					counter: res
				}, () => {
					SocketIO.emit('connectCounter', {id: this.state.counterId, name: this.state.counter.name});
					// get all called tickets
					DataAPI.get('/api/ticket/called')
						.then( res =>{
							res.map((ticket, index) => {
								ticket.number = utils.formatTicketNumber(ticket.number);
								return ticket;
							});
							let cTicket = _.filter(res, o => {
								return o.counter._id === this.state.counterId;
							});
							if(cTicket.length > 0){
								cTicket.number = utils.formatTicketNumber(cTicket.number);
								this.setState({ticket: cTicket[0]});
							}
						})
						.catch( err => {
							console.error(err);
						});
				});
			})
			.catch(err => {
				console.error(err);
			});
		
		// refresh the keypad after the server is restart(start)
		SocketIO.on('serverstart', (msg) => {
			console.log('server is start');
			window.location.reload();
		});

		SocketIO.on('ping', msg=>{
			console.log('ping', msg);
			// window.location.reload();
		})
		
		SocketIO.on('callTicketo', (ticket) => {
			if(ticket.counter._id === this.state.counterId){
				ticket.number = utils.formatTicketNumber(ticket.number);
				this.setState({
					ticket: ticket
				});
			}
		});
		
		// ticket changed called->noshow
		SocketIO.on('called_to_noshow_o', ticket => {
			if(ticket.counter._id === this.state.counterId){				
				this.setState({
					ticket: null
				});
			}
		});
		// ticket changed called->waiting
		SocketIO.on('called_to_waiting_o', ticket => {
			if(ticket.counter._id === this.state.counterId){				
				this.setState({
					ticket: null
				});
			}
		});

		// noshow -> called
		SocketIO.on('noshow_to_called_o', (ticket) => {
			if(ticket.counter._id === this.state.counterId){
				ticket.number = utils.formatTicketNumber(ticket.number);
				
				this.setState({
					ticket: ticket
				});
			}
		});
		// waiting -> called
		SocketIO.on('waiting_to_called_o', (ticket) => {
			if(ticket.counter._id === this.state.counterId){
				ticket.number = utils.formatTicketNumber(ticket.number);
				
				this.setState({
					ticket: ticket
				});
			}
		});
		//  -> complete
		SocketIO.on('completeTicketo', ({ticket}) => {
			if(ticket.counter._id === this.state.counterId){
				ticket.number = utils.formatTicketNumber(ticket.number);
				this.setState({
					ticket: null
				});
			}
		});
		//  complete -> called
		SocketIO.on('complete_to_called_o', (ticket) => {
			if(ticket.counter._id === this.state.counterId){
				ticket.number = utils.formatTicketNumber(ticket.number);
				this.setState({
					ticket: ticket
				});
			}
		});

		SocketIO.on('refresh_counter', counter => {
			console.log('counter', counter);
			if(counter._id === this.state.counterId){
				console.log('This counter will restart by the keypad');
				window.location.reload();
			}
		});
		//  reset all status
		SocketIO.on('reset', () => {
			this.setState({
				ticket: null
			});
		});


	}
	componentWillUnmount(){
		SocketIO.emit('deviceDisconnect', {type:'counter',id: this.state.counterId, name: this.state.counter.name});
		SocketIO.close();
	}
	render() {
		return (
			<div>
				<div className="counter-block">
					<div className="header-block">
						<img src={campanylogo} alt="Company Logo"/>
						<div className="name">{'櫃枱' + _.get(this.state.counter, 'name', '')}</div>						
					</div>
					<div className="body-block">
						{
						this.state.ticket &&
						<div
							className={(this.state.isCalling ? 'calling ' : '') + 'ticket-number'}>
							{this.state.ticket.queue.code + this.state.ticket.number}
						</div>
						}
					</div>

				</div>
			</div>
		)
	}

}

export default withRouter(Counter);


// WEBPACK FOOTER //
// client/display/Counter.js
