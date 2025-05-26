// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const refreshToken = sequelizeClient.define(
    'refresh_token',
    {
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      refresh: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expired: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true
      }

    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  refreshToken.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    refreshToken.belongsTo(models.users, {
      foreignKey: 'uid', // foreign key di tabel refresh_token
      targetKey: 'uid', // primary key di tabel users
      as: 'user' // alias relasi
    })
  }

  return refreshToken
}
