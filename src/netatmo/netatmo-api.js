import axios from "axios";
import qs from "qs";
import { JsonDB, Config } from "node-json-db";

export const netatmoApiClient = function (config) {
  const jsonDb = new JsonDB(new Config(config.common.dbFile, true, true, "/"));

  const client_id = config.netatmo.clientId;
  const client_secret = config.netatmo.clientSecret;

  const axiosInstance = axios.create({
    baseURL: "https://api.netatmo.com",
  });

  // provide bearer token as header
  axiosInstance.interceptors.request.use(
    async (reqConfig) => {
      const access_token = await readAccessToken();
      reqConfig.headers["Authorization"] = `Bearer ${access_token}`;
      return reqConfig;
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
    const refresh_token = await readRefreshToken();

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

    await updateTokens(response.data);
  };

  const readAccessToken = async () => {
    return await jsonDb.getObjectDefault("/netatmo/api/access-token");
  };

  const readRefreshToken = async () => {
    return await jsonDb.getObjectDefault("/netatmo/api/refresh-token");
  };

  const updateTokens = async (tokenResponse) => {
    await jsonDb.push("/netatmo/api/access-token", tokenResponse.access_token);
    await jsonDb.push(
      "/netatmo/api/refresh-token",
      tokenResponse.refresh_token
    );
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
