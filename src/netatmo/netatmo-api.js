import axios from "axios";

const BASE_URL = "https://api.netatmo.com";

export const netatmoApiClient = function (options) {
  return {
    authenticate: async function () {
      if (options.access_token) {
        this.client_id = options.client_id;
        this.client_secret = options.client_secret;
        this.scope =
          options.scope ||
          "read_homecoach read_station read_thermostat write_thermostat read_camera";

        await this.authenticate_refresh(options.refresh_token);

        return this;
      }
    },
    authenticate_refresh: async function (refresh_token) {
      const formData = new FormData();
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", "refresh_token");
      formData.append("client_id", this.client_id);
      formData.append("client_secret", this.client_secret);

      return await axios({
        method: "post",
        url: `${BASE_URL}/oauth2/token`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  };
};
