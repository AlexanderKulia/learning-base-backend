module.exports = {
  apps: [
    {
      name: "lbb",
      script:
        "npm install && npm run db:migrate:prod && npm run db:generate && npm run prebuild && npm run build && npm run start:prod",
    },
  ],
};
