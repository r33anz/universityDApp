import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildStudent } from '../../helpers/factories.js';

vi.mock('../../../src/infrastructure/db/models/student.js', () => ({
  default: {
    findOne: vi.fn(),
    update: vi.fn(),
  },
}));

const { default: StudentService } = await import('../../../src/application/services/StudentService.js');
const { default: student } = await import('../../../src/infrastructure/db/models/student.js');

describe('StudentService', () => {
  beforeEach(() => {
    student.findOne.mockReset();
    student.update.mockReset();
  });

  describe('verifyStudentInDB', () => {
    it('queries student by codSIS and returns the row', async () => {
      const row = buildStudent({ codSIS: '202099999' });
      student.findOne.mockResolvedValue(row);

      const result = await StudentService.verifyStudentInDB('202099999');

      expect(student.findOne).toHaveBeenCalledWith({ where: { codSIS: '202099999' } });
      expect(result).toBe(row);
    });

    it('returns null when student does not exist', async () => {
      student.findOne.mockResolvedValue(null);
      const result = await StudentService.verifyStudentInDB('000');
      expect(result).toBeNull();
    });
  });

  describe('hasCredential', () => {
    // IM-6 RE-OPENED: the live column is VARCHAR (migration 20250312030825 created
    // it as Sequelize.STRING) despite the model declaring BOOLEAN. Until a proper
    // migration converts the column type, the query MUST send the string 'true'
    // — otherwise Postgres throws "operator does not exist: character varying = boolean".
    it("queries with the string literal 'true' (matches the live VARCHAR column)", async () => {
      student.findOne.mockResolvedValue(null);
      await StudentService.hasCredential('202012345');
      expect(student.findOne).toHaveBeenCalledWith({
        where: { codSIS: '202012345', hasCredential: 'true' },
      });
    });

    it('returns the matching row when credential exists', async () => {
      const row = buildStudent({ hasCredential: true });
      student.findOne.mockResolvedValue(row);
      const result = await StudentService.hasCredential('202012345');
      expect(result).toBe(row);
    });
  });

  describe('assignedCredential', () => {
    it("issues UPDATE with the string literal 'true' for the given codSIS", async () => {
      student.update.mockResolvedValue([1]);
      await StudentService.assignedCredential('202012345');
      expect(student.update).toHaveBeenCalledWith(
        { hasCredential: 'true' },
        { where: { codSIS: '202012345' } }
      );
    });
  });
});
