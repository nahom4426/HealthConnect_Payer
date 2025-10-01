import type { AsyncResponse } from "@/types/interface";
import type { AxiosError, AxiosResponse } from "axios";
import { toasted } from "@/utils/utils";

export async function responseHandler<T>(
  request: Promise<AxiosResponse<T>>
): Promise<AsyncResponse<T>> {
  try {
    const res = await request;
    return {
      status: 200,
      data: res.data as T,
      success: true,
      error: "",
    };
  } catch (error: any) {
    // this is true when the request gets to the server
    // and there is some error on the server
    if (error.response) {
      // Prefer message from server without arbitrarily trimming characters
      const data = error.response?.data as any;
      let errMsg: string = '';

      if (typeof data === 'string') {
        // If server returned a raw string (e.g., "Error: Failed ..."),
        // strip a leading "Error: " prefix if present, but do not trim arbitrarily
        errMsg = data.replace(/^Error:\s*/i, '').trim();
      } else if (data?.message) {
        errMsg = String(data.message);
      } else if (data?.error) {
        errMsg = String(data.error);
      } else {
        errMsg = error.message || 'Request failed';
      }

      toasted(false, '', errMsg)
      return {
        success: false,
        status: error.response.status,
        error: errMsg
      };
    }
    // this is true when the request cant get to the server
    // eg. connection error
    if (error.request) {
      toasted(false, '', error.message)
      return {
        success: false,
        status: error.code,
        error: error.message,
      };
    }
  }

  return {
    success: false,
    status: 500,
    error: 'Unexpected error'
  }
}
