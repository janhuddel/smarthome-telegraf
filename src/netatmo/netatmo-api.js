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

  // provide bearer token as header (except for token refresh endpoint)
  axiosInstance.interceptors.request.use(
    async (reqConfig) => {
      // Don't add Authorization header for token refresh endpoint
      if (reqConfig.url !== "/oauth2/token") {
        const access_token = await readAccessToken();
        reqConfig.headers["Authorization"] = `Bearer ${access_token}`;
      }
      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  // refresh token on 401, 403, or 400 (which might indicate invalid token)
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      // Don't try to refresh token if the error is from the token refresh endpoint itself
      if (url === "/oauth2/token") {
        return Promise.reject(error);
      }
      
      // Handle authentication errors - try to refresh token
      if ((status === 401 || status === 403 || status === 400) && error.config && !error.config._retry) {
        // Mark this request as retried to avoid infinite loops
        error.config._retry = true;
        try {
          await refreshToken();
          // Retry the original request with new token
          return axiosInstance(error.config);
        } catch (refreshError) {
          // Check if it's an invalid_grant error (refresh token expired/invalid)
          if (refreshError.response?.data?.error === "invalid_grant") {
            const authError = new Error(
              "Refresh token is invalid or expired. Please re-authenticate.\n" +
              "Visit https://dev.netatmo.com/apps/ to create a new token.\n" +
              "You may need to delete the tokens in the database file and re-authenticate."
            );
            authError.name = "AuthenticationError";
            return Promise.reject(authError);
          }
          
          // If refresh fails, throw the refresh error (not the original error)
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  const refreshToken = async () => {
    const refresh_token = await readRefreshToken();

    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    const data = qs.stringify({
      grant_type: "refresh_token",
      refresh_token,
      client_id,
      client_secret,
    });

    const requestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
      _retry: true, // Mark as retried to prevent infinite loop
    };
    
    const response = await axiosInstance.request(requestConfig);

    // Update both access-token and refresh-token in the database
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
