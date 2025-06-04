// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {

    uid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },


  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
     users.hasMany(models.refresh_token, {
      foreignKey: 'uid',  // foreign key di tabel refresh_token
      sourceKey: 'uid',   // primary key di tabel users
      as: 'refresh_token' // alias relasi
    });
     users.hasMany(models.account_bank, {
      foreignKey: 'uid',  // foreign key di tabel refresh_token
      sourceKey: 'uid',   // primary key di tabel users
      as: 'account_bank' // alias relasi
    });
     users.hasMany(models.balance, {
      foreignKey: 'uid',  // foreign key di tabel refresh_token
      sourceKepy: 'uid',   // primary key di tabel users
      as: 'balance' // alias relasi
    });
     users.hasMany(models.his_transaksi, {
      foreignKey: 'uid',  // foreign key di tabel refresh_token
      sourceKey: 'uid',   // primary key di tabel users
      as: 'his_transaksi' // alias relasi
    });

  };

  return users;
};
