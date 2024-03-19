import axios from 'axios';
import store from '@/store/index.js';

let authHeader = '';
const userObj = store.state.auth.user;
if (userObj.token) {
  authHeader = 'Token ' + userObj.token;
}

console.log('IvaultService:UserObj.token: ', userObj.token);

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authHeader,
  },
});

const apiUploaderClient = axios.create({
  baseURL: process.env.VUE_APP_UPLOADER_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authHeader,
  },
});

// NO PROGRESS BAR VERSION:
// If used from here, the progress bar is not dynamically updated.
const apiFileUploadClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
    Authorization: authHeader,
  },
  onUploadProgress: (uploadEvent) => {
    const prog = Math.round((uploadEvent.loaded / uploadEvent.total) * 100);
    console.log('inClient__UploadProgress', prog);
  },
});

// CURATOR API CLIENT
const curatorApiClient = axios.create({
  baseURL: process.env.VUE_APP_CURATOR_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default {
  getCsvFileFromS3(data) {
    const endpoint = data['endpoint'];
    let url =
      endpoint + '?mode=' + data['mode'] + '&filename=' + data['filename'];
    return curatorApiClient.get(url);
  },
  login(payload) {
    return apiClient.post('api/user/login/', payload);
  },
  getUser(userEmail, token) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    return apiClient.get('api/user/?email=' + userEmail, { headers });
  },
  getHumanReadableAssetLogs(filename) {
    return apiClient.get('api/logs/asset?filename=' + filename);
  },
  getAsset(aid) {
    return apiClient.get('api/asset/?id=' + aid);
  },
  updateAssetOption(payload) {
    return apiClient.put('api/asset/', payload);
  },
  commitUploadBatch(uploadData) {
    // NOTE: Use  apiUploaderClient.post()  for uplaods
    let url = '/api/uploader/commit-batch/';
    url = url.replace('//', '/');
    return apiUploaderClient.post(url, uploadData);
  },
  commitCancelUploadBatch(payload) {
    // NOTE: Use  apiUploaderClient.post()  for uplaods
    let url = '/api/uploader/remove-uploaded-temp-files/';
    url = url.replace('//', '/');
    return apiUploaderClient.post(url, payload);
  },
  deleteAsset(seq, aid) {
    return apiClient.delete('api/asset?id=' + aid);
  },
  initialUpload(formData) {
    return apiFileUploadClient.post('api/uploader/upload-assets/', formData);
  },
  getAssetOptions() {
    return apiClient.get('api/asset/option/group/');
  },
  filteredAssetOtionHeaders(strIn) {
    // IF strIN > 3 chars fetch a result
    return apiClient.get(
      'api/asset/option/group/filtered?filteringString=' + strIn
    );
  },
  filteredAssetOtionsAny(strIn) {
    // IF strIN > 3 chars fetch a result
    return apiClient.get(
      'api/asset/option/filtered/any?filteringString=' + strIn
    );
  },
  getOptionGroupDefinitions(optionHeaderIn) {
    return apiClient.get(
      'api/asset/option/group/values/?optionGroupName=' + optionHeaderIn
    );
  },
  getAssetSearchResults(queryStr, filenameStr = '') {
    let path = 'api/search/';
    let url = path + '?q=' + queryStr;
    if (filenameStr.length > 0) {
      url += '&filestr=' + filenameStr;
    }
    store.dispatch('setAssetSearchQueryApiCall', '/' + url);
    return apiClient.get(url);
  },
  getAssetSearchResultsByFilename(filename) {
    const url = 'api/search/assets/by-filename/?filename=' + filename;
    console.log('getAssetSearchResultsByFilename API URL:-->', url);
    return apiClient.get(url);
  },
  getSearchTemplates(tid = null) {
    let url = 'api/search/template/';
    if (tid > 0) {
      url += '?tid=' + tid;
    }
    console.log('API GET SEARCH TEMPLAE(S):-->', url);
    return apiClient.get(url);
  },
  postSearchTemplateCreate(templateData) {
    console.log('iVaultSERVICE:', templateData);
    const url = '/api/search/template/';
    return apiClient.post(url, templateData);
  },
  deleteSearchTemplate(jsonBody) {
    console.log('iVaultSERVICE:', jsonBody);
    //   jsonBody eg:
    //     tid = {"tid": [<int>] } ~or~ {"tid": [5,6,7] }
    const url = '/api/search/template/';
    return apiClient.delete(url, { data: jsonBody });
  },
  getTagbotOptionsByFilename(params) {
    let url = '/api/tagbot/process/';
    url += '?filename=' + params.filename;
    url += '&mode=' + params.mode;
    url += '&dryrun=' + params.dryrun;
    return apiClient.get(url);
  },
};
