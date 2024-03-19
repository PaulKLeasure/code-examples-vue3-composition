import axios from 'axios';
import store from '@/store/index.js';

let authHeader = '';
const userObj = store.state.auth.user;
if (userObj.token) {
  authHeader = 'Token ' + userObj.token;
}

console.log('AltTextBotService:UserObj.token: ', userObj.token);
console.log(
  'baseURL: process.env.VUE_APP_API_URL',
  process.env.VUE_APP_API_URL
);

const altTextApiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authHeader,
  },
});

export default {
  testAltTextByImage(data) {
    let imgData = '';
    if (data.assetId) {
      imgData = 'assetId=' + data.assetId;
    }
    if (data.filename) {
      imgData = 'filename=' + data.filename;
    }
    const url = '/api/alttext/template-test?' + imgData + '&altText';
    return altTextApiClient.get(url);
  },
  getAltTextBotTemplateList(page) {
    return altTextApiClient.get('/api/alttext/template?index&page=' + page);
  },
  getAltTextTemplate(id) {
    return altTextApiClient.get('/api/alttext/template?id=' + id);
  },
  createAltTextTemplate(payload) {
    return altTextApiClient.post('/api/alttext/template', payload);
  },
  updateAltTextTemplate(payload) {
    return altTextApiClient.put('/api/alttext/template', payload);
  },
  deleteAltTextTemplate(id) {
    return altTextApiClient.delete('/api/alttext/template?id=' + id);
  },
};
