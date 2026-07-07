import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../src/application/useCases/notification/UseCaseNotification.js', () => ({
  default: {
    recoverAllNotifications: vi.fn(),
    getPaginatedNotifications: vi.fn(),
    attendNotifications: vi.fn(),
  },
}));

vi.mock('../../src/infrastructure/blockchain/contracts/CredentialManagementContract.js', () => ({
  default: { contract: { on: vi.fn() } },
}));

vi.mock('../../src/infrastructure/ipfs/ipfsConnection.js', () => ({
  default: { client: null, initialize: vi.fn(), uploadFile: vi.fn() },
}));

vi.mock('../../src/infrastructure/db/dbConnection.js', () => ({
  default: { sync: vi.fn(), authenticate: vi.fn(), define: vi.fn() },
}));

vi.mock('../../src/infrastructure/db/models/student.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/notification.js', () => ({ default: {} }));
vi.mock('../../src/infrastructure/db/models/globalplan.js', () => ({ default: {} }));

const { app } = await import('../../src/app.js');
const { default: UseCase } =
  await import('../../src/application/useCases/notification/UseCaseNotification.js');

describe('GET /api/allNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('BR-N8: no query params → returns ALL without pagination', async () => {
    UseCase.recoverAllNotifications.mockResolvedValue([{ id: 'a' }]);
    const res = await request(app).get('/api/allNotifications');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: [{ id: 'a' }] });
    expect(UseCase.getPaginatedNotifications).not.toHaveBeenCalled();
  });

  it('returns success:true with empty data + message when there are no notifications', async () => {
    UseCase.recoverAllNotifications.mockResolvedValue([]);
    const res = await request(app).get('/api/allNotifications');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: [],
      message: 'No hay notificaciones disponibles',
    });
  });

  it('BR-N7: with query params → uses paginated path', async () => {
    UseCase.getPaginatedNotifications.mockResolvedValue({
      notifications: [{ id: 'p1' }],
      pagination: { total: 1 },
    });
    const res = await request(app).get('/api/allNotifications?page=2&pageSize=5&status=attended');
    expect(res.status).toBe(200);
    expect(UseCase.getPaginatedNotifications).toHaveBeenCalledWith({
      page: 2, pageSize: 5, statusFilter: 'attended',
    });
  });

  it('500 when useCase throws', async () => {
    UseCase.recoverAllNotifications.mockRejectedValue(new Error('db'));
    const res = await request(app).get('/api/allNotifications');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/attend-multiple', () => {
  beforeEach(() => vi.clearAllMocks());

  it('400 when notificationIds is missing or not an array', async () => {
    const res = await request(app).post('/api/attend-multiple').send({});
    expect(res.status).toBe(400);
  });

  it('200 on success — but IM-4: updatedCount is undefined because useCase does not provide it', async () => {
    UseCase.attendNotifications.mockResolvedValue({ success: true, fromList: [{ id: 'a' }] });
    const res = await request(app).post('/api/attend-multiple').send({ notificationIds: ['a'] });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(res.body.updatedCount).toBeUndefined();
    expect(res.body.fromList).toEqual([{ id: 'a' }]);
  });
});
