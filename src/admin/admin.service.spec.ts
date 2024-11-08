import { Test, TestingModule } from '@nestjs/testing';
import { AdminProvider } from './admin.service';

describe('AdminProvider', () => {
  let service: AdminProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminProvider],
    }).compile();

    service = module.get<AdminProvider>(AdminProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
