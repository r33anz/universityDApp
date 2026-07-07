import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/application/services/NotificationService.js', () => ({
  default: {
    getAllNotifications: vi.fn(),
    getPaginatedNotifications: vi.fn(),
    recoverSisCodes: vi.fn(),
    attendNotifications: vi.fn(),
  },
}));

vi.mock('../../../src/application/services/EmailService.js', () => ({
  default: { sendSisCodes: vi.fn() },
}));

const { default: UseCase } =
  await import('../../../src/application/useCases/notification/UseCaseNotification.js');
const { default: NotificationService } =
  await import('../../../src/application/services/NotificationService.js');
const { default: EmailService } =
  await import('../../../src/application/services/EmailService.js');

describe('UseCaseNotification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recoverAllNotifications delegates to service', async () => {
    NotificationService.getAllNotifications.mockResolvedValue([{ id: 'a' }]);
    const result = await UseCase.recoverAllNotifications();
    expect(result).toEqual([{ id: 'a' }]);
  });

  it('getPaginatedNotifications forwards args verbatim', async () => {
    NotificationService.getPaginatedNotifications.mockResolvedValue({ notifications: [], pagination: {} });
    await UseCase.getPaginatedNotifications({ page: 2, pageSize: 5, statusFilter: 'attended' });
    expect(NotificationService.getPaginatedNotifications).toHaveBeenCalledWith({
      page: 2, pageSize: 5, statusFilter: 'attended',
    });
  });

  describe('attendNotifications', () => {
    it('BR-N6: looks up SIS codes, sends them to the hardcoded admin email, then attends them', async () => {
      NotificationService.recoverSisCodes.mockResolvedValue(['202012345']);
      EmailService.sendSisCodes.mockResolvedValue({ success: true });
      NotificationService.attendNotifications.mockResolvedValue({ success: true, fromList: [] });

      await UseCase.attendNotifications(['n1']);

      expect(NotificationService.recoverSisCodes).toHaveBeenCalledWith(['n1']);
      expect(EmailService.sendSisCodes).toHaveBeenCalledWith(
        'rodrigo33newton@gmail.com',
        ['202012345']
      );
      expect(NotificationService.attendNotifications).toHaveBeenCalledWith(['n1']);
    });

    it('IM-4: does NOT add updatedCount to the result (documents controller/useCase mismatch)', async () => {
      NotificationService.recoverSisCodes.mockResolvedValue([]);
      EmailService.sendSisCodes.mockResolvedValue({});
      NotificationService.attendNotifications.mockResolvedValue({ success: true, fromList: [] });

      const result = await UseCase.attendNotifications(['n1']);
      expect(result).not.toHaveProperty('updatedCount');
    });
  });
});
