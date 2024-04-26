import axios from 'axios';
import store from '@/store/index.js';

let authHeader = '';
const userObj = store.state.auth.user;
if (userObj.token) {
  authHeader = 'Token ' + userObj.token;
}

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authHeader,
  },
});

export default {
  getTagbotMappingsAll() {
    let url = '/api/tagbot/';
    return apiClient.get(url);
  },
  createTagbotMapping(payload) {
    // eg. payload
    //  {nomenclature:<str>, logic:<str>, mode_id:<int>, option_ids<str>,}
    return apiClient.post('/api/tagbot/', payload);
  },
  updateTagbotMappingsById(payload) {
    // eg. payload
    //  {nomenclature:<str>, logic:<str>, mode_id:<int>, option_ids<str>,}
    return apiClient.put('/api/tagbot/', payload);
  },
  getTagbotMappingsById(id) {
    let url = '/api/tagbot/?id=' + id;
    return apiClient.get(url);
  },
  searchTagbotMappingsByAlphaCode(params) {
    let url = 'api/tagbot/search/';
    url += '&mode=file-code';
    url += '?str=' + params.string;
    return apiClient.get(url);
  },
  searchTagbotMappingsByLogic(params) {
    let url = 'api/tagbot/search/';
    url += '&mode=logic';
    url += '?str=' + params.string;
    return apiClient.get(url);
  },
  getTagbotOptionsByFilename(params) {
    let url = '/api/tagbot/process/';
    url += '?filename=' + params.filename;
    url += '&mode=' + params.mode;
    url += '&dryrun=' + params.dryrun;
    return apiClient.get(url);
  },
  deleteTagbotMapping(tmid) {
    return apiClient.delete('/api/tagbot/?tmid=' + tmid);
  },
};
