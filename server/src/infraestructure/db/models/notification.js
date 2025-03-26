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
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false 
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  isAttended: {
    type: DataTypes.BOOLEAN,
    allowNull: true, 
    defaultValue: false 
  },
  emmittedAt: {
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