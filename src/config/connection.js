import axios from 'axios';
import base_url from './base_url';

const conn = axios.create({
    baseURL: base_url.baseURL_BE,
    timeout: 1000,    
});

export default conn;