// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const accountBank = sequelizeClient.define(
    'account_bank',
    {
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
      },
      nama_bank: {
        type: DataTypes.STRING,
        allowNull: false
      },
      account: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
  accountBank.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    accountBank.belongsTo(models.users, {
      foreignKey: 'uid', // foreign key di tabel refresh_token
      targetKey: 'uid', // primary key di tabel users
      as: 'user' // alias relasi
    })
  }

  return accountBank
}
