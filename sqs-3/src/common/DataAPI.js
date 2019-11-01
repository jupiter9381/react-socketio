import axios from 'axios';
const serverURL = 'http://localhost:8080';

function get(url='', data = {}, callback){
    return axios.get(`${serverURL}${url}`)
        .then(res => {
            // console.log('get response', res);
            return res.data;    
        })
        .catch(err => {
            console.error(err);
            return err;
        });
}

function post(url='', data={}){
    console.log('post method');
    return axios.post(`${serverURL}${url}`, data)
        .then(res => {
            // console.log('response in post', res);
            return res.data;
        })
        .catch(function (error) {
            console.log(error);
            return error;
        });
}
export {get, post};
