import React from 'react'
import _ from 'lodash';

import FlexView from 'react-flexview';
import FlatButton from 'material-ui/FlatButton';
import Modal from 'react-awesome-modal'

import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import * as DataAPI from "../common/DataAPI.js";

// import logo from "../images/lemondice-yellow-transparent.png";
import '../style.css';
import DoneIcon from 'material-ui/svg-icons/action/done';
// import utils from '../common/utils';

import DatetimeRangePicker from 'react-datetime-range-picker';
import Datetime from 'react-datetime';
import moment from 'moment';
import * as SocketIO from '../common/SocketIO';
// import './Sample.less';
const now = new Date();
const yesterdayBegin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
const todayBegin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const dateBeginConstraint = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

const styles = {
    button: {
        height: 99,
        lineHeight: '100px',
        paddingLeft: 20,
        paddingRight: 20,
    },
    label: {
        fontSize: 55,
    },
    icon: {
        width: 90,
        height: 90
    },
    teste: {
        textAlign: 'center',
        backgroundColor: '#ff0000'
    },
    input: {
        textAlign: 'center',
    }
};

class Admin extends React.Component {
    constructor(props) {
        super();
        this.state = {
            startDate: new Date(),
            endDate: new Date(),
            datetime: {
                start: yesterdayBegin,
                end: todayBegin
            },
            schedule: '',
            counters: [{ _id: 'total', nameCH: '全部' }],
            counterSelected: null,
            queues: [],
            queueSelected: { "name": { "zhTW": "全部", "en": "whole" }, "code": "全部", _id: 'total' },
            issuedTickets: null,
            calledTickets: null,
            completedTickets: null,
            waitTickets: null,
            noshowTickets: null,
            timeIssuedToCall: null,
            timeCallToComplete: null,
            input: "",
            visible2: false,
        };
        SocketIO.init();
        this.selectQueue = this.selectQueue.bind(this);
        this.selectCounter = this.selectCounter.bind(this);
    }

    onHandleChangeDateTime = value => {
        console.log('value', value);
        if (moment(value.start).isBefore(dateBeginConstraint)) {
            window.alert('有效數據期限為30天，請選擇正確的開始日子');
            return;
        }

        this.setState({ datetime: value });
    }

    scheduleConfirm = () => {
        DataAPI.post('/api/data/schedule', {schedule: this.state.schedule})
            .then(res => {

            }).catch(err => {
                console.error(err);
            })
        console.log(this.state.schedule);
    }
    handleConfirm = () => {
        console.log('handle confirm btn clicked');
        console.log(this.state.datetime, this.state.queueSelected, this.state.counterSelected);
        let { datetime, queueSelected, counterSelected } = this.state
        DataAPI.post('/api/data/analysis', { datetime, queueSelected, counterSelected })
            .then(res => {
                console.log('res', res);
                let issuedTickets = res.issuedTickets.length > 0 ? res.issuedTickets[0].dataCount : 0;
                let calledTickets = res.calledTickets.length > 0 ? res.calledTickets[0].dataCount : 0;
                let completedTickets = res.completedTickets.length > 0 ? res.completedTickets[0].dataCount : 0;
                let waitTickets = res.waitTickets.length > 0 ? res.waitTickets[0].dataCount : 0;
                let noshowTickets = res.noshowTickets.length > 0 ? res.noshowTickets[0].dataCount : 0;
                let timeIssuedToCall = res.timeIssuedToCall ? moment.utc(res.timeIssuedToCall * 1000).format('mm:ss') : 'NaN';
                let timeCallToComplete = res.timeCallToComplete ? moment.utc(res.timeCallToComplete * 1000).format('mm:ss') : 'NaN';


                this.setState({
                    issuedTickets, calledTickets, completedTickets, waitTickets, noshowTickets, timeIssuedToCall, timeCallToComplete
                })

                console.log('length', issuedTickets);
            })
            .catch(err => {
                console.error(err);
            });
    }

    componentDidMount() {
        SocketIO.init();
        DataAPI.get('/api/data/schedule', {})
            .then(res => {
                this.setState({schedule: res[0].schedule})
                console.log(res);
            })
            .catch(err => {
                console.error(err);
            })
        DataAPI.get('/api/data/queue', {})
            .then(res => {
                let queue = [{ "name": { "zhTW": "全部", "en": "whole" }, "code": "全部", _id: 'total' }];
                this.setState({
                    queues: [...queue, ...res]
                });
            })
            .catch(err => {
                console.error(err);
            });

        DataAPI.get('/api/data/counter', {})
            .then(res => {
                let counters = this.state.counters;
                res.map(ele => {
                    ele.nameCH = '櫃枱' + ele.name;
                    ele.name = `counter${ele.name}`;
                    counters.push(ele);
                    return ele;

                });

                console.log('counters', counters)
                this.setState({
                    counters,
                    counterSelected: counters[0]
                });

            })
            .catch(error => {
                console.error(error);
            });

        setTimeout(() => {
            this.handleConfirm();
        }, 1000);
    }

    scheduleChange(e) {
        this.setState({schedule: e.target.value});
    }
    selectQueue(e) {
        let queueSelected = _.find(this.state.queues, o => o._id === e.target.value);
        this.setState({
            queueSelected
        });
    }

    selectCounter(e) {
        let counterSelected = _.find(this.state.counters, o => o._id === e.target.value);

        this.setState({
            counterSelected
        });
    }



    openModal2() {
        this.setState({
            visible2: true
        });
    }

    closeModal2() {
        this.setState({
            visible2: false
        });
    }

    Confirm_clicked() {
        if (this.state.input === '123456') {
            SocketIO.emit('resetAll');
            console.log("Pass: " + this.state.input);
            this.closeModal2();
            alert("系統已重設");
            this.setState({ input: "" })
        }
        else {
            alert("密碼錯誤");
            this.setState({ input: "" })
        }
    }

    onChangeInput = event => {
        let input = event.target.value;
        this.setState(
            {
                input: input
            }
        );
    };

    render() {
        const { datetime } = this.state;
        return (
            <div className="admin-container">

                <div className="admin-body">
                    <div>
                        <FlexView className="admin-body-block">
                            <div className="queue-block" style={{ width: "100%" }}>
                                <FlexView className="queue-body-block">
                                    <div className="queue-body-right-block" style={{ width: "100%" }}>
                                        <div className="admin-upper-block" style={{ width: "100%", position: "relative" }}>

                                        </div>
                                    </div>
                                </FlexView>
                            </div>
                        </FlexView>
                    </div>
                    <div className="admin-date-block">
                        <FlexView column>

                            <DatetimeRangePicker
                                onChange={this.onHandleChangeDateTime}
                                className={'datetime-range-picker'}
                                startDate={datetime.start}
                                endDate={datetime.end}
                            />

                            <div className="btn-wrapper-reset" style={{ position: "absolute", top: "1%", left: "1%" }}>
                                <FlatButton
                                    label="重設系統"
                                    onClick={() => this.openModal2()}
                                />
                            </div>

                            <div className="btn-wrapper" style={{ position: "absolute", top: "1%", right: "1%" }}>
                                <FlatButton
                                    label="更新"
                                    icon={<DoneIcon className="icon" />}
                                    onClick={this.handleConfirm}
                                />
                            </div>

                        </FlexView>

                    </div>
                    <div>
                        <FlexView className="admin-pad">

                            <FlexView column className="admin-counter-block">
                                <div className="queues-block">
                                    <div className="text" style={{float: 'none'}}>隊伍</div>
                                    <RadioButtonGroup
                                        name="counters"
                                        valueSelected={this.state.queueSelected ? _.get(this.state.queueSelected, '_id') : ''}
                                        onChange={this.selectQueue}
                                        className="radio-group-block"
                                        style={{display: 'flex',
                                        flexDirection: 'column',
                                        height: '220px',
                                        flexWrap: 'wrap'}}>
                                        {
                                            _.map(this.state.queues, (queue, index) => {
                                                let margin = index == 4 ? '55px' : '7px';
                                                return (<RadioButton
                                                    key={index}
                                                    value={queue._id}
                                                    label={queue.code}
                                                    labelStyle={{
                                                        color: 'white', width: '200px'
                                                    }}
                                                    className="radio-block"
                                                    style={{width: '150px', margin: '7px', flexGrow:'0', marginTop: margin}}
                                                />)
                                                
                                            })
                                        }
                                    </RadioButtonGroup>
                                </div>
                                <div className="queues-schedule">
                                    <label className="schedule-label">Schedule: </label>
                                <input
                                    onChange={this.schduleChange}
                                    className={'form-control schedule'}
                                    defaultValue={this.state.schedule}
                                    type={'number'}
                                    onChange={value =>this.scheduleChange(value)}
                                />
                                    <div className="btn-wrapper">
                                        <FlatButton
                                        label="更新"
                                        icon={<DoneIcon className="icon" />}
                                        onClick={this.scheduleConfirm}
                                    />
                                    </div>
                                </div>        
                            </FlexView>

                            <FlexView column className="admin-counter-block">
                                <RadioButtonGroup
                                    name="counters"
                                    valueSelected={this.state.counterSelected ? _.get(this.state.counterSelected, '_id') : ''}
                                    onChange={this.selectCounter}
                                    className="radio-group-block"
                                    style={{display: 'flex',
                                        flexDirection: 'column',
                                        height: '560px',
                                        flexWrap: 'wrap'}}
                                    >
                                    {
                                        this.state.counters.map((counter, key) => {
                                            let margin = key == 11 ? '55px' : '7px';
                                            return (<RadioButton
                                                key={key}
                                                value={counter._id}
                                                label={counter.nameCH}
                                                onChange={(e) => { console.log('onchange', e.target.value) }}
                                                labelStyle={{ color: '#33a532', width: '200px' }}
                                                className="radio-block counter-radio"
                                                style={{width: '200px', margin: '7px', marginTop: margin, flexGrow:'0'}}
                                            />)
                                        })
                                    }
                                </RadioButtonGroup>
                            </FlexView>

                            <FlexView column className="admin-table-block">
                                <table style={{ textAlign: 'center', fontSize: 'large' }}>
                                    <thead>
                                        <tr>
                                            <th>項目 (Item)</th>
                                            <th>總數 (Total)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>總發出票數<br />(Total Issued tickets)</td>
                                            <td>{this.state.issuedTickets}</td>
                                        </tr>
                                        <tr>
                                            <td>總已叫票數<br />(Total called tickets)</td>
                                            <td>{this.state.calledTickets}</td>
                                        </tr>
                                        <tr>
                                            <td>總已完成票數<br />(Total Completed tickets)</td>
                                            <td>{this.state.completedTickets}</td>
                                        </tr>
                                        <tr>
                                            <td>總要求等待票數<br />(Total request for wait tickets)</td>
                                            <td>{this.state.waitTickets}</td>
                                        </tr>
                                        <tr>
                                            <td>總沒有出現票數<br />(Total request for no show tickets)</td>
                                            <td>{this.state.noshowTickets}</td>
                                        </tr>
                                        <tr>
                                            <td>平均從發出到已叫時間<br />(Average time taken from issued to called)</td>
                                            <td>{this.state.timeIssuedToCall}</td>
                                        </tr>
                                        <tr>
                                            <td>平均從已叫到完成時間<br />(Average time taken from called to completed)</td>
                                            <td>{this.state.timeCallToComplete}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </FlexView>
                        </FlexView>
                    </div>
                </div>

                <Modal visible={this.state.visible2} width="580" height="340" effect="fadeInUp" onClickAway={() => this.closeModal2()}>
                    <h1 style={styles.teste}>請輸入密碼</h1>
                    <h1 style={styles.input}>
                        <input

                            width="200"
                            style={styles.input}
                            value={this.state.input}
                            placeholder={"請輸入密碼"}
                            onChange={e => this.onChangeInput(e)}
                        />
                    </h1>
                    <FlatButton
                        style={styles.button}
                        labelStyle={styles.label}
                        label="確認"
                        fullWidth={true}
                        onClick={() => this.Confirm_clicked()} />
                    <FlatButton
                        style={styles.button}
                        labelStyle={styles.label}
                        label="取消"
                        fullWidth={true}
                        onClick={() => this.closeModal2()} />
                </Modal>

            </div>
        );
    }
}

export default Admin;
