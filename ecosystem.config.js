module.exports = {
  apps: [
    {
      script: "index.js",
      watch: ".output",
      instances: "max",
      exec_mode: "cluster",
      env: {
        PORT: 11443,
        DATABASE_URL: "file:/var/www/fileshare/prisma/fileshare-production.db",
      },
    },
  ],
};
