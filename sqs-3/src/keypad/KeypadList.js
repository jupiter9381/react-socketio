import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import _ from 'lodash';

import Keypad from './Keypad';


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

class KeypadList extends Component {
	constructor(props) {
		super();
		this.state = {
		    keypads: [1,2,3,4,5,6,7,8],
		};
		
	}
	
	
  	render() {
		return (
			<div>
				<div>
					{
					_.map(this.state.keypads, (keypad, index) => (
						<Link to={`/keypad/${keypad}`} key={index}>
							<FlatButton
								style={styles.button}
								labelStyle={styles.label}
								label={`Keypad ${keypad}`}
								fullWidth={true}
							/>
						</Link>
					))
					}
				</div>
				<Route path={`/keypad/:padId`} component={Keypad} />
			</div>
		)
  }
}

export default KeypadList;

