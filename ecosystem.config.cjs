// Production config
module.exports = {
  apps: [
    {
      name: "fileshare",
      script: ".output/server/index.mjs",
      watch: ".output",
      instances: "max",
      exec_mode: "cluster",
      env: {
        PORT: process.env.FILESHARE_PORT,
      },
    },
  ],
};
