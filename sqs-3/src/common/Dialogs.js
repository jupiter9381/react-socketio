import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import _l from 'lodash';

class Dialogs extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      text: '',
      actions: [],
      open: false,
    };

    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    this.props.onInit(this);
  }

  componentWillUnmount() {
    this.props.onInit(null);
  }

  error(err) {
    const errorMsgs = _l.has(err, 'errors') ? _l.map(err.errors, (error) => {
      return error.message;
    }) : err;
    this.setState({
      title: '錯誤',
      text: _l.castArray(errorMsgs),
      open: true,
      actions: [
        <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this.handleClose}
        />,
      ],
    });
  }

  alert(options) {
    const title = options.title;
    const text = options.text;

    this.setState({
      title: title || '',
      text: _l.castArray(text || ''),
      open: true,
      actions: [
        <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this.handleClose}
        />,
      ],
    });
  }

  confirm(options, cb) {
    const title = options.title;
    const text = options.text;

    this.setState({
      title: title || '',
      text: _l.castArray(text || ''),
      open: true,
      actions: [
        <FlatButton
          label="取消"
          primary={true}
          onTouchTap={this.handleClose}
        />,
        <FlatButton
          label="確認"
          primary={true}
          onTouchTap={this.handleConfirm.bind(this, cb)}
        />,
      ],
    });
  }

  handleConfirm(cb) {
    this.setState({ open: false });
    if (cb) return cb();
  }

  handleClose() {
    this.setState({ open: false });
  };

  render() {
    return (
      <Dialog
        title={this.state.title}
        actions={this.state.actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}>
        {_l.map(this.state.text, (text, index) =>
          <div key={index}>{text}</div>
        )}
      </Dialog>
    )
  }
}

export default Dialogs;


// WEBPACK FOOTER //
// client/common/Dialogs.js
