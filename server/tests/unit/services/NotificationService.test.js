import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildNotification } from '../../helpers/factories.js';
import { STATUS_ENUM } from '../../../src/interface/enums/statusEnums.js';

vi.mock('../../../src/infrastructure/db/models/notification.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../src/app.js', () => ({
  io: { emit: vi.fn() },
}));

const { default: NotificationService } =
  await import('../../../src/application/services/NotificationService.js');
const { default: notification } =
  await import('../../../src/infrastructure/db/models/notification.js');
const { io } = await import('../../../src/app.js');

describe('NotificationService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('saveNotification', () => {
    it('persists with renamed field { message ← body } and returns JSON', async () => {
      const row = buildNotification();
      notification.create.mockResolvedValue(row);

      const result = await NotificationService.saveNotification({
        title: 't',
        body: 'b',
        emittedAt: new Date('2025-01-01'),
        from: '202012345',
      });

      expect(notification.create).toHaveBeenCalledWith({
        title: 't',
        message: 'b',
        emittedAt: new Date('2025-01-01'),
        from: '202012345',
      });
      expect(result).toMatchObject({ id: row.id, title: row.title });
    });

    it('swallows DB errors and returns undefined (documents current behavior)', async () => {
      notification.create.mockRejectedValue(new Error('db'));
      const result = await NotificationService.saveNotification({});
      expect(result).toBeUndefined();
    });
  });

  describe('sendNotificationToClientSide', () => {
    it('emits "newNotification" with formatted date DD/MM/YYYY HH:mm:ss', () => {
      NotificationService.sendNotificationToClientSide({
        id: 'n1',
        title: 't',
        message: 'm',
        emittedAt: new Date('2025-03-15T10:30:45Z'),
        status: 'not_attended',
        from: '202012345',
      });

      expect(io.emit).toHaveBeenCalledWith('newNotification', expect.objectContaining({
        id: 'n1',
        title: 't',
        message: 'm',
        formattedDate: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/),
        status: 'not_attended',
        from: '202012345',
      }));
    });
  });

  describe('lastNotification', () => {
    it('orders by emittedAt DESC and returns the first', async () => {
      const last = buildNotification();
      notification.findOne.mockResolvedValue(last);
      const result = await NotificationService.lastNotification();
      expect(notification.findOne).toHaveBeenCalledWith({ order: [['emittedAt', 'DESC']] });
      expect(result).toBe(last);
    });
  });

  describe('getAllNotifications', () => {
    it('maps DB rows, formats dates, drops Sequelize internals', async () => {
      notification.findAll.mockResolvedValue([
        buildNotification({ id: 'a', emittedAt: new Date('2025-03-15T10:30:45Z'), attendedAt: null }),
      ]);
      const result = await NotificationService.getAllNotifications();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'a',
        title: 'Nueva peticion de kardex',
        message: expect.any(String),
        isAttended: undefined,
        emittedAt: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/),
        attendedAt: null,
        from: '202012345',
      });
    });

    it('returns [] when the DB throws (documents fail-soft behavior)', async () => {
      notification.findAll.mockRejectedValue(new Error('db'));
      const result = await NotificationService.getAllNotifications();
      expect(result).toEqual([]);
    });
  });

  describe('getPaginatedNotifications', () => {
    it('applies offset/limit/order and returns pagination metadata', async () => {
      notification.findAndCountAll.mockResolvedValue({
        count: 27,
        rows: [buildNotification({ id: 'p1' })],
      });

      const result = await NotificationService.getPaginatedNotifications({
        page: 3,
        pageSize: 10,
        statusFilter: 'attended',
      });

      expect(notification.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'attended' },
        limit: 10,
        offset: 20,
        order: [['emittedAt', 'DESC']],
      });
      expect(result).toMatchObject({
        total: 27, page: 3, pageSize: 10, totalPages: 3,
      });
      expect(result.notifications).toHaveLength(1);
    });

    it('ignores statusFilter when value is "ALL"', async () => {
      notification.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      await NotificationService.getPaginatedNotifications({ page: 1, pageSize: 10, statusFilter: 'ALL' });
      expect(notification.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });
  });

  describe('attendNotifications', () => {
    it('updates only rows in NOT_ATTENDED → IN_PROCESS', async () => {
      notification.update.mockResolvedValue([2]);
      notification.findAll.mockResolvedValue([buildNotification({ id: 'a' })]);
      const result = await NotificationService.attendNotifications(['a', 'b']);
      expect(notification.update).toHaveBeenCalledWith(
        { status: STATUS_ENUM.IN_PROCESS },
        { where: { id: ['a', 'b'], status: STATUS_ENUM.NOT_ATTENDED } }
      );
      expect(result.success).toBe(true);
      expect(result.fromList).toHaveLength(1);
    });
  });

  describe('studentAskedKardex', () => {
    // BR-K4 + IM-7: the "pending request" flag is checked against IN_PROCESS, not NOT_ATTENDED
    it('searches by status=IN_PROCESS and returns boolean', async () => {
      notification.findOne.mockResolvedValue(buildNotification({ status: STATUS_ENUM.IN_PROCESS }));
      const exists = await NotificationService.studentAskedKardex('202012345');
      expect(notification.findOne).toHaveBeenCalledWith({
        where: { from: '202012345', status: STATUS_ENUM.IN_PROCESS },
      });
      expect(exists).toBe(true);
    });

    it('returns false when no IN_PROCESS notification is found', async () => {
      notification.findOne.mockResolvedValue(null);
      const exists = await NotificationService.studentAskedKardex('x');
      expect(exists).toBe(false);
    });
  });

  describe('updateNotificationToAttended', () => {
    it('flips IN_PROCESS notifications of a given SIS to ATTENDED', async () => {
      notification.update.mockResolvedValue([1]);
      const res = await NotificationService.updateNotificationToAttended('202012345');
      expect(notification.update).toHaveBeenCalledWith(
        { status: STATUS_ENUM.ATTENDED, attendedAt: expect.any(Date) },
        { where: { from: '202012345', status: STATUS_ENUM.IN_PROCESS } }
      );
      expect(res).toEqual({ success: true });
    });

    it('throws when sisCode is missing', async () => {
      const res = await NotificationService.updateNotificationToAttended(undefined);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/SIS code is required/);
    });
  });

  describe('recoverSisCodes', () => {
    it('returns the from-list of given notification ids', async () => {
      notification.findAll.mockResolvedValue([
        { from: '202012345' }, { from: '202099999' },
      ]);
      const result = await NotificationService.recoverSisCodes(['a', 'b']);
      expect(notification.findAll).toHaveBeenCalledWith({
        where: { id: ['a', 'b'] },
        attributes: ['from'],
      });
      expect(result).toEqual(['202012345', '202099999']);
    });
  });
});
