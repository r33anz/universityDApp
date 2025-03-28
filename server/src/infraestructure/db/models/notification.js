// notification.js (versión ES Modules)
import { Model, DataTypes } from 'sequelize';
import sequelize from '../dbConnection.js';


class Notification extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}


Notification.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false 
  },
  title: {
    type: DataTypes.STRING(25),
    allowNull: true 
  },
  message: {
    type: DataTypes.STRING(125),
    allowNull: true 
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: true, 
    defaultValue: false 
  },
  emittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attendedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'Notifications', 
  timestamps: false, 
  underscored: false
});


export default Notification;