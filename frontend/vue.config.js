const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: "all",
    client: {
      webSocketURL: 'wss://4313-185-196-117-65.ngrok-free.app/ws', // Замените на свой URL ngrok
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  }
});
