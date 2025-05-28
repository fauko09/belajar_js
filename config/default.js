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
  refresh_secret: "jE+z2uQ6zFAhiQVNQqqHr27eZrM=",
  midtrans_key: "Mid-server-Y76t93n5wyXI8Fi-qqB-HB9t",
  midtrans_dis: "IRIS-09a990ef-37c5-4f11-a393-3704c5045cde",
  mysql: `${DB_DIALECT}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
};