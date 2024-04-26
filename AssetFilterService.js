import axios from "axios";
import store from "@/store/index.js";

let authHeader = "";
const userObj = store.state.auth.user;
if (userObj.token) {
  authHeader = "Token " + userObj.token;
}

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: authHeader
  }
});
export default {
  getAssetFilterNavIndex(dat) {
    return apiClient.get("/api/filternav?mode=index&page=" + dat["page"]);
  },
  createAssetFilterNav(payload) {
    return apiClient.post("api/filternav", payload);
  },
  getAssetFilterNav(dat) {
    let endpoint = "/api/filternav?mode=filter&";
    const pg =
      dat["page"] !== undefined ? "&page=" + dat["page"] : "&page=" + 1;
    endpoint += pg;
    const mach =
      dat["mach_name"] !== undefined ? "&mach_name=" + dat["mach_name"] : "";
    endpoint += mach;
    const loc_path =
      dat["location_path"] !== undefined
        ? "&location_path=" + dat["location_path"]
        : "";
    endpoint += loc_path;
    const id = dat["id"] !== undefined ? "&id=" + dat["id"] : "";
    endpoint += id;
    return apiClient.get(endpoint);
  },
  updateAssetFilterNav(payload) {
    return apiClient.put("api/filternav", payload);
  },
  deleteAssetFilterNav(id) {
    return apiClient.delete("/api/filternav?id=" + id);
  },
  createAssetFilterNavGroup(payload) {
    let endpoint = "/api/filternav-group";
    return apiClient.post(endpoint, payload);
  },
  getAssetFilterNavGroup(q) {
    console.log("===|||???///===", q["parentId"]);
    let endpoint = "/api/filternav-group?";
    const id = q["id"] !== undefined ? "id=" + q["id"] : "";
    endpoint = endpoint + id;
    const parentId =
      q["parentId"] !== undefined ? "parentId=" + q["parentId"] : "";
    endpoint = endpoint + parentId;
    const create = q["create"] !== undefined ? "create=" + q["create"] : "";
    endpoint += create;
    console.log(
      "====///===== AssetFilterService::getAssetFilterNavGroup  Endpoint:: ",
      endpoint
    );
    return apiClient.get(endpoint);
  },
  updateAssetFilterNavGroup(payload = {}) {
    let endpoint = "/api/filternav-group";
    return apiClient.put(endpoint, payload);
  },
  removeAssetFilterNavGroupItem(itemId) {
    let endpoint = "/api/filternav-group?mode=item-remove&itemId=" + itemId;
    return apiClient.delete(endpoint);
  },
  deleteAssetFilterNavGroup(gid) {
    return apiClient.delete("/api/filternav-group?gid=" + gid);
  }
};
