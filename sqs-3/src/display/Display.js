import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import _ from 'lodash';

import * as history from '../common/history.js';
import Landscape from './Landscape.js';
import Kiosk from './Kiosk.js';
import CounterList from './CounterList.js';
import * as DataAPI from "../common/DataAPI.js";

const styles = {
	button: {
		height: 110,
		lineHeight: '110px',
		paddingLeft: 20,
		paddingRight: 20,
	},
	label: {
		fontSize: 60,
	},
	icon: {
		width: 90,
		height: 90
	},
};

class Display extends Component {
  	constructor() {
    	super();
    	this.state = {
      		displays: []
    	};
  	}
    componentDidMount() {
		DataAPI.get('/api/data/display', {})
			.then(res=> {
				this.setState({
					displays: res
				});
			})
			.catch(err => {
				console.error(err);
			});
		// this.setState({
		// 	displays:[
		// 		{
		// 			"_id":"582aa60cc0fa44d70c797e19",
		// 			"name":"大屏慕",
		// 			"theme":"landscape",
		// 			"advPositions":[
		// 				{
		// 					"_id":{"$oid":"5c47183dd010d80b2402ca7e"},
		// 					"row":0,
		// 					"column":0,
		// 					"scheduleToShow":[
		// 						{
		// 							"startAt":{
		// 								"minute":0,
		// 								"hour":6
		// 							},
		// 							"photos":[],
		// 							"videos":[],
		// 							"_id":{"$oid":"5c47183dd010d80b2402ca7f"},
		// 							"mediaType":"none"
		// 						}
		// 					]
		// 				}
		// 			],
		// 			"bottomText":"請各經銷商留意叫號，如編號將到請出納部等侯，如已過5個，請重新按票。謝謝。",
		// 			"callingVolume":100,
		// 			"updatedAt":{"$date":"2019-01-22T13:18:53.113Z"},
		// 			"__v":0
		// 		},
		// 		{
		// 			"_id":"582aa60cc0fa44d70c797e20",
		// 			"name":"櫃枱",
		// 			"theme":"counter",
		// 			"advPositions":[
		// 				{"_id":{"$oid":"5c47183dd010d80b2402ca81"},"row":0,"column":0,"scheduleToShow":[{"startAt":{"minute":0,"hour":6},"photos":[],"videos":[],"_id":{"$oid":"5c47183dd010d80b2402ca82"},"mediaType":"none"}]}
		// 			],
		// 			"callingVolume":100,
		// 			"updatedAt":{"$date":"2019-01-22T13:18:53.115Z"},
		// 			"__v":0
		// 		},
		// 		{
		// 			"_id":"582aa60cc0fa44d70c797e21",
		// 			"name":"Kiosk",
		// 			"theme":"kiosk",
		// 			"advPositions":[
		// 				{"_id":{"$oid":"5c47183dd010d80b2402ca84"},"row":0,"column":0,"scheduleToShow":[{"startAt":{"minute":0,"hour":6},"photos":[],"videos":[],"_id":{"$oid":"5c47183dd010d80b2402ca85"},"mediaType":"none"}]}
		// 			],
		// 			"callingVolume":100,
		// 			"updatedAt":{"$date":"2019-01-22T13:18:53.117Z"},
		// 			"__v":0
		// 		}
		// 	]
		// });
	}
  // componentWillMount() {
  //   this.fetchDisplayList((err, displays) => {
  //     if (err) return console.error('fetchDisplayList error:', err);
  //
  //     this.setState({
  //       displays,
  //     });
  //   });
  // }

  // fetchDisplayList(cb) {
  //   DataAPI.get('/api/display/list', {}, cb);
  // }

	render() {
		return (
			<div>
				{
				history.getCurrentLocation() === '/display' &&
				<div className="display-list">
					{this.state.displays.length &&
					_.map(this.state.displays, (display, index) => (
						<Link to={`/display/${display.theme}/${display._id}`} key={index}>
						<FlatButton
							style={styles.button}
							labelStyle={styles.label}
							label={display.name}
							fullWidth={true}
						/>
						</Link>
					))
					}
				</div>
				}
				<Route path="/display/landscape/:displayId" component={Landscape} />
				<Route path="/display/kiosk/:displayId" component={Kiosk} />
				<Route path="/display/counter/:displayId" component={CounterList} />
			</div>
		)
	}
}

export default Display;
