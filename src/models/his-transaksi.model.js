// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const hisTransaksi = sequelizeClient.define(
    'his_transaksi',
    {
      his_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
      },
      tipe: {
        type: DataTypes.ENUM('debit', 'kredit'),
        allowNull: false
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
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
  hisTransaksi.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    hisTransaksi.belongsTo(models.users, {
      foreignKey: 'uid', // foreign key di tabel refresh_token
      targetKey: 'uid', // primary key di tabel users
      as: 'user' // alias relasi
    })
  }

  return hisTransaksi
}
