import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../src/services/webhook.service';
import { WebhookRepository } from '../src/repositories/webhook.repository';
import { CreateWebhookDto } from '../src/dto/webhook.dto';

describe('WebhookService', () => {
  let service: WebhookService;
  let repository: jest.Mocked<WebhookRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: WebhookRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findBySource: jest.fn(),
            findByEvent: jest.fn(),
            count: jest.fn(),
            deleteAll: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    repository = module.get(WebhookRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const createDto: CreateWebhookDto = {
        source: 'github',
        event: 'push',
        payload: { ref: 'refs/heads/main' },
      };

      const expectedWebhook = {
        id: 'webhook-123',
        source: 'github',
        event: 'push',
        payload: { ref: 'refs/heads/main' },
        receivedAt: new Date(),
      };

      repository.create.mockResolvedValue(expectedWebhook as any);

      const result = await service.createWebhook(createDto);

      expect(result).toEqual(expectedWebhook);
      expect(repository.create).toHaveBeenCalledWith({
        source: 'github',
        event: 'push',
        payload: { ref: 'refs/heads/main' },
      });
    });

    it('should handle webhook creation with complex payload', async () => {
      const createDto: CreateWebhookDto = {
        source: 'stripe',
        event: 'payment.succeeded',
        payload: {
          id: 'evt_123',
          amount: 1000,
          currency: 'usd',
          metadata: { orderId: '12345' },
        },
      };

      const expectedWebhook = {
        id: 'webhook-456',
        source: 'stripe',
        event: 'payment.succeeded',
        payload: createDto.payload,
        receivedAt: new Date(),
      };

      repository.create.mockResolvedValue(expectedWebhook as any);

      const result = await service.createWebhook(createDto);

      expect(result).toEqual(expectedWebhook);
      expect(repository.create).toHaveBeenCalledWith({
        source: createDto.source,
        event: createDto.event,
        payload: createDto.payload,
      });
    });
  });

  describe('getAllWebhooks', () => {
    it('should return all webhooks without pagination', async () => {
      const webhooks = [
        {
          id: 'webhook-1',
          source: 'github',
          event: 'push',
          payload: {},
          receivedAt: new Date(),
        },
        {
          id: 'webhook-2',
          source: 'stripe',
          event: 'payment.succeeded',
          payload: {},
          receivedAt: new Date(),
        },
      ];

      repository.findAll.mockResolvedValue(webhooks as any);

      const result = await service.getAllWebhooks();

      expect(result).toEqual(webhooks);
      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return paginated webhooks', async () => {
      const webhooks = [
        {
          id: 'webhook-1',
          source: 'github',
          event: 'push',
          payload: {},
          receivedAt: new Date(),
        },
      ];

      repository.findAll.mockResolvedValue(webhooks as any);

      const result = await service.getAllWebhooks(1, 10);

      expect(result).toEqual(webhooks);
      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should return paginated webhooks for page 2', async () => {
      const webhooks = [
        {
          id: 'webhook-11',
          source: 'github',
          event: 'pull_request',
          payload: {},
          receivedAt: new Date(),
        },
      ];

      repository.findAll.mockResolvedValue(webhooks as any);

      const result = await service.getAllWebhooks(2, 10);

      expect(result).toEqual(webhooks);
      expect(repository.findAll).toHaveBeenCalledWith(2, 10);
    });

    it('should return empty array when no webhooks exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.getAllWebhooks();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('getWebhookById', () => {
    it('should return webhook by id', async () => {
      const webhook = {
        id: 'webhook-123',
        source: 'github',
        event: 'push',
        payload: { ref: 'refs/heads/main' },
        receivedAt: new Date(),
      };

      repository.findById.mockResolvedValue(webhook as any);

      const result = await service.getWebhookById('webhook-123');

      expect(result).toEqual(webhook);
      expect(repository.findById).toHaveBeenCalledWith('webhook-123');
    });

    it('should return null when webhook is not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.getWebhookById('nonexistent-id');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('getWebhookCount', () => {
    it('should return the count of webhooks', async () => {
      repository.count.mockResolvedValue(42);

      const result = await service.getWebhookCount();

      expect(result).toBe(42);
      expect(repository.count).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no webhooks exist', async () => {
      repository.count.mockResolvedValue(0);

      const result = await service.getWebhookCount();

      expect(result).toBe(0);
      expect(repository.count).toHaveBeenCalledTimes(1);
    });
  });
});
