import { Model, DataTypes } from 'sequelize';
import sequelize from '../dbConnection.js';

class Student extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

Student.init({
  codSIS: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Student',
});

export default Student;