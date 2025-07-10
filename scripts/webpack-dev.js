import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "../webpack.config.js";

// Create webpack compiler
const compiler = webpack(config);

// Create dev server
const devServerOptions = config.devServer;
const server = new WebpackDevServer(devServerOptions, compiler);

// Start server on the specified port and host
const runServer = async () => {
  console.log("Starting webpack dev server...");
  await server.start();
  console.log(
    `Webpack dev server is running at http://${devServerOptions.host}:${devServerOptions.port}`,
  );
};

runServer();
