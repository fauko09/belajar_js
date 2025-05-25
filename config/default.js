require("dotenv").config();
const { HOST, PORT, DB_DIALECT, DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } =
  process.env;

module.exports = {
  host: HOST || "localhost",
  port: PORT || 3030,
  public: "../public/",
  paginate: {
    default: 10,
    max: 50,
  },
  authentication: {
    entity: "user",
    service: "users",
    secret: "jE+z2uQ6zFAhiQVNQqqHr27eZrM=",
    authStrategies: ["jwt", "local"],
    jwtOptions: {
      header: {
        typ: "access",
      },
      audience: "https://yourdomain.com",
      issuer: "feathers",
      algorithm: "HS256",
      expiresIn: "1d",
    },
    local: {
      usernameField: "email",
      passwordField: "password",
    },
    oauth: {
      redirect: "/",
      auth0: {
        key: "<auth0 oauth key>",
        secret: "<auth0 oauth secret>",
        subdomain: "<auth0 subdomain>",
        scope: ["profile", "openid", "email"],
      },
      google: {
        key: "<google oauth key>",
        secret: "<google oauth secret>",
        scope: ["profile", "email"],
      },
    },
  },
  mysql: `${DB_DIALECT}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
};