import axiosAuth from "axios";
// import Router from "next/router";
import { CONSTANTS } from "./constants";
import https from "https";

export const axios = axiosAuth.create({
  baseURL: CONSTANTS.API,
  timeout: 10000,
  withCredentials: true,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    // Expires: "0",
    // "Cache-Control": "no-cache, no-store",
    // Control: "must-revalidate max-age=0"
  },
});

export const setAuthHeader = async (data) => {
  return new Promise((resolve) => {
    let uid = data ? data.uid : null;
    let locale = data ? data.locale : "ar";
    if (!uid) {
      // console.log("removed header");
      delete axios.defaults.headers.common["Authorization"];
      return resolve("");
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${uid}`;
    axios.defaults.headers.common["locale"] = locale;
    // console.log("Added header: " + uid);
    resolve("");
  });
};

// export const setLocaleAuthHeader = (locale) => {
//   // console.log(`SET AUTH LOCALE ${locale}`);
//   axios.defaults.headers.common["locale"] = locale;
// };

/**
 * Interceptors
 */

// maintenance mode
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const redirect = error.response && error.response.data?.redirect;
//     if (redirect) {
//       Router.replace(redirect);
//     }
//     return Promise.reject(error);
//   }
// );
