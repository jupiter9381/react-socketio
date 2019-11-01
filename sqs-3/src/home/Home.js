import React, { Component } from 'react';
import {
  Link
} from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import KeyboardIcon from 'material-ui/svg-icons/hardware/keyboard';
import TvIcon from 'material-ui/svg-icons/hardware/tv';
// import PersonIcon from 'material-ui/svg-icons/social/person';

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

class Home extends Component {
  constructor(props) {
    super();
  }

  componentWillMount() {

  }

  render() {
    return (
      <div>
        {/*<Link to="/kiosk"><FlatButton*/}
          {/*style={styles.button}*/}
          {/*labelStyle={styles.label}*/}
          {/*label="Kiosk"*/}
          {/*fullWidth={true}*/}
          {/*icon={<TvIcon style={styles.icon} />}*/}
        {/*/></Link>*/}
        <Link to="/keypadlist"><FlatButton
          style={styles.button}
          labelStyle={styles.label}
          label="keypadList"
          fullWidth={true}
          primary={true}
          icon={<KeyboardIcon style={styles.icon} />}
        /></Link>
        <Link to="/display"><FlatButton
          style={styles.button}
          labelStyle={styles.label}
          label="Display"
          fullWidth={true}
          icon={<TvIcon style={styles.icon} />}
        /></Link>
        <Link to="/admin"><FlatButton
          style={styles.button}
          labelStyle={styles.label}
          label="Admin"
          fullWidth={true}
          icon={<TvIcon style={styles.icon} />}
        /></Link>
        {/*<Link to="/adminPanel"><FlatButton*/}
          {/*style={styles.button}*/}
          {/*labelStyle={styles.label}*/}
          {/*fullWidth={true}*/}
          {/*label="Admin Panel"*/}
          {/*primary={true}*/}
          {/*icon={<PersonIcon style={styles.icon} />}*/}
        {/*/></Link>*/}
      </div>
    )
  }
}

export default Home
