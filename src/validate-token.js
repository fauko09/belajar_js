const { Forbidden } = require('@feathersjs/errors');

module.exports = async function validateTokenAgainstRefreshToken(context) {
  const { app, params } = context;
  const token = params.authentication && params.authentication.accessToken;

  if (!token) {
    throw new Forbidden('No access token provided');
  }

  const refreshTokenModel = app.get('sequelizeClient').models.refresh_token;

  // Cari token di tabel refresh_token
  const tokenRecord = await refreshTokenModel.findOne({
    where: { token }
  });

  if (!tokenRecord) {
    throw new Forbidden('Invalid or revoked token');
  }

  // Optional: cek apakah token sudah expired atau revoked
  if (tokenRecord.revoked) {
    throw new Forbidden('Token has been revoked');
  }

  // Jika valid, lanjutkan proses
  return context;
};
