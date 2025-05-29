module.exports = {
  apps: [
    {
      name: "next-app",
      script: "node_modules/.bin/next",
      args: "start",
    },
    {
      name: "ws-server",
      script: "src/server/wsServer.ts",
      interpreter: "ts-node",
      // Notice we put the --project flag first and then register tsconfig-paths.
      // This ensures that ts-node loads your configuration with the correct baseUrl and paths.
      interpreter_args: "--project tsconfig.json -r tsconfig-paths/register",
    },
  ],
};
