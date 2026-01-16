import axios from 'axios';

const api = axios.create({
    baseURL: 'http://10.20.114.192:8000',
    // baseURL: 'http://172.25.208.1:8000',
});

export default api;