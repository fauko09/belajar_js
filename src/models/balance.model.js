// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const balance = sequelizeClient.define(
    'balance',
    {
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
      },
      saldo: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
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
  balance.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    balance.belongsTo(models.users, {
      foreignKey: 'uid', // foreign key di tabel refresh_token
      targetKey: 'uid', // primary key di tabel users
      as: 'user' // alias relasi
    })
  }

  return balance
}
