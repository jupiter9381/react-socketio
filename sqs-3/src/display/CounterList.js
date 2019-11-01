import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import _ from 'lodash';

import * as history from '../common/history.js';
import * as DataAPI from "../common/DataAPI.js";
import Counter from './Counter';
import * as SocketIO from '../common/SocketIO';
// import { Socket } from 'dgram';
const styles = {
  	button: {
		height: 110,
		lineHeight: '110px',
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: '#eee'
  	},
	label: {
		fontSize: 60,
	},
	icon: {
		width: 90,
		height: 90
	}
};

class CounterList extends Component {
	constructor(props) {
		super();
		this.state = {
			displayId: _.get(props.match.params, 'displayId'),
			counters: [],
		};
		SocketIO.init();
	}
	
	
	componentDidMount() {
		
		DataAPI.get('/api/data/counter', {})
			.then(res => {
				this.setState({
					counters: res
				});				
			})
			.catch(error => {
				console.error(error);
			});
		SocketIO.on('counterChange', (data) => {
		
			this.setState({
				counters: data
			});
		});
	}
	componentWillUnmount() {
		SocketIO.close();
	}
	
  	render() {
		return (
			<div>
				{
				history.getCurrentLocation() === `/display/counter/${this.state.displayId}` &&
				<div>
					{
					_.map(this.state.counters, (counter, index) => (
						counter.status ?
						<Link 
							to={`/display/counter/${this.state.displayId}/${counter._id}`} 
							key={index}
						 	// onClick={e=>e.preventDefault()} 
							>
							<FlatButton
								style={styles.button}
								labelStyle={styles.label}
								label={counter.name+' / ON'}
								fullWidth={true}
							/>
						</Link>
						: <Link to={`/display/counter/${this.state.displayId}/${counter._id}`} key={index}>
							<FlatButton
								style={styles.button}
								labelStyle={styles.label}
								label={counter.name + ' / OFF'}
								fullWidth={true}
							/>
						</Link>
					))
					}
				</div>
				}
				<Route path={`/display/counter/:${this.state.displayId}/:counterId`} component={Counter} />
			</div>
		)
  }
}

export default CounterList;


// WEBPACK FOOTER //
// client/display/CounterList.js
