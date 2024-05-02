// Production config
module.exports = {
  apps: [
    {
      name: "fileshare",
      script: ".output/server/index.mjs",
      watch: false,
      env: {
        PORT: process.env.FILESHARE_PORT,
      },
    },
  ],
};
