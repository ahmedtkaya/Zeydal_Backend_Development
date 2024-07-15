const production = process.argv.slice(2).includes("dev") ? false : true;

const config = {
  development: !production,
  production: production,
  deployment: production ? "PRODUCTION" : "DEVELOPMENT",
};
export default config;
