import _ from 'lodash';
import moment from 'moment';

const utils = {
    formatTicketNumber: number => {
        return _.padStart(number, 3, '0');
    },
    getDate: date => {
        return moment(date).format('YYYY-MM-DD');
    },
    getTime: date => {
        return moment(date).format('HH:mm');
    }
};

export default utils;