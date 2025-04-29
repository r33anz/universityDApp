// subject.js (versión ES Modules)
import { Model, DataTypes } from 'sequelize';
import sequelize from '../dbConnection.js';

class GlobalPlan extends Model {
  static associate(models) {
    // Aquí definirías las asociaciones si es necesario
  }
}

GlobalPlan.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Para generar automáticamente un UUID
    primaryKey: true,
    allowNull: false
  },
  materia: {
    type: DataTypes.STRING(100),
    allowNull: false
  },path: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'GlobalPlan',
  tableName: 'GlobalPlans',
  timestamps: false,
  underscored: false
});

export default GlobalPlan;
