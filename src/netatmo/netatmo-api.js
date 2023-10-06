import axios from "axios";
import qs from "qs";

export const netatmoApiClient = function (options) {
  const client_id = options.clientId;
  const client_secret = options.clientSecret;
  let access_token = options.accessToken;
  let refresh_token = options.refreshToken;

  const axiosInstance = axios.create({
    baseURL: "https://api.netatmo.com",
  });

  // provide bearer token as header
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers["Authorization"] = `Bearer ${access_token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // refresh token on 403
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 403) {
        try {
          await refreshToken();
          return axiosInstance(error.config);
        } catch (refreshError) {
          throw refreshError;
        }
      }
      return Promise.reject(error);
    }
  );

  const refreshToken = async () => {
    const data = qs.stringify({
      grant_type: "refresh_token",
      refresh_token,
      client_id,
      client_secret,
    });

    const response = await axiosInstance.request({
      method: "post",
      maxBodyLength: Infinity,
      url: "/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    });

    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
  };

  return {
    getStationsData: async function () {
      const response = await axiosInstance.request({
        method: "get",
        maxBodyLength: Infinity,
        url: `/api/getstationsdata`,
      });

      return response.data;
    },
  };
};
