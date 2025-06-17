import axios, { type AxiosInstance } from "axios";
import { responseHandler } from "./ApiResponseHandler";
import { useAuthStore } from "@/stores/auth";

const backendApiUrl = import.meta.env.v_API_URI;

export default class ApiService {
  api: AxiosInstance;

  _initApi(baseURL?: string) {
    this.api = axios.create({
      // withCredentials: true,
      baseURL: baseURL || backendApiUrl,
      // timeout: 3000,
      validateStatus: (status) => {
        return status >= 200 && status < 300;
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  constructor(baseURL: string) {
    
  
    if (baseURL) this._initApi(baseURL);
    else this._initApi(backendApiUrl);
  }
  /**
   *
   * @param {string} url
   * @param {Object} config
   * @returns
   */
  async get(url: string, config = {}) {
    return await responseHandler(
      this.api({
        ...config,
        url,
        method: "get",
      })
    );
  }

  async post(url: string, data: any, config = {}) {

    return await responseHandler(
      this.api({
        ...config,
        url,
        data,
        method: "post",
      })
    );
  }

  async put(url: string, data: any, config = {}) {
    return await responseHandler(
      this.api({
        ...config,
        url,
        data,
        method: "put",
      })
    );
  }

  async patch(url: string, data: any, config = {}) {
    return await responseHandler(
      this.api({
        ...config,
        url,
        data,
        method: "patch",
      })
    );
  }

  async delete(url: string, config = {}) {
    return await responseHandler(
      this.api({
        ...config,
        url,
        method: "delete",
      })
    );
  }

  addAuthenticationHeader() {
    const authStore = useAuthStore();
    this.api.defaults.headers.common.Authorization = `Bearer ${authStore.auth?.accessToken}`;
    return this;
  }
}
