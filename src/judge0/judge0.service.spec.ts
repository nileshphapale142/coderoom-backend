import { Test, TestingModule } from '@nestjs/testing';
import { Judge0Service } from './judge0.service';
import { HttpService } from '@nestjs/axios';
import { env } from './../../configs';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CreateSubmissionDTO, GetSubmissionDTO } from './dto';

describe('Judge0Service', () => {
  let service: Judge0Service;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Judge0Service,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<Judge0Service>(Judge0Service);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fetch about data', async () => {
    const responseData = {
      version: '1.14.0',
      homepage: 'https://judge0.com',
      source_code: 'https://github.com/judge0/judge0',
      maintainer:
        'Herman Zvonimir Došilović <hermanz.dosilovic@gmail.com>',
    };

    const mockResponse: AxiosResponse = {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await service.about();

    expect(result).toEqual(responseData);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/about`,
      {
        headers: {
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
        },
      },
    );
  });

  it('fetch supported languages', async () => {
    const expectedStructure = expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      }),
    ]);

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of(expectedStructure as any));

    const result = await service.getLanguages();
    expect(result).toEqual(expectedStructure);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/languages`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
        }),
      }),
    );
  });

  it('fetch a language', async () => {
    const expectedStructure = expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
      is_archived: expect.any(Boolean),
      source_file: expect.any(String),
      compile_cmd: expect.any(String),
      run_cmd: expect.any(String),
    });

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of(expectedStructure as any));

    const result = await service.getLanguage(50);

    expect(result).toEqual(expectedStructure);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/language/50`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
        }),
      }),
    );
  });

  it('fetch statuses', async () => {
    const expectedStructure = expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        description: expect.any(String),
      }),
    ]);

    const mockResponse = [
      {
        id: 1,
        description: 'hello',
      },
    ];

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of(mockResponse as any));

    const result = await service.getStatuses();

    expect(result).toEqual(expectedStructure);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/statuses`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
        }),
      }),
    );
  });

  it('create submission', async () => {
    const dto: CreateSubmissionDTO = {
      language_id: 92,
      source_code: btoa("print('hello adam')"),
      stdin: 'SnVkZ2Uw',
    };

    const mockResponse = {
      data: {
        token: Math.random().toString(36).substring(7),
      },
    };

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(mockResponse as any));

    const result = await service.createSubmission(dto);

    expect(result).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );

    expect(httpService.post).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/submissions`,
      dto,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('get submission', async () => {
    const dto: GetSubmissionDTO = {
      token: '3153c2c5-79e4-4808-a5cd-23094c1f79e6',
    };

    const mockResponse = {
      stdout: 'hello, Judge0\n',
      time: '0.001',
      memory: 2008,
      stderr: null,
      token: '3153c2c5-79e4-4808-a5cd-23094c1f79e6',
      compile_output: null,
      message: null,
      status: {
        id: 3,
        description: 'Accepted',
      },
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of(mockResponse as any));

    const result = await service.getSubmission(dto);

    expect(result).toEqual(mockResponse);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://${env.JUDGE0.HOST}/submissions/3153c2c5-79e4-4808-a5cd-23094c1f79e6`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-rapidapi-key': env.JUDGE0.KEY,
          'x-rapidapi-host': env.JUDGE0.HOST,
        }),
      }),
    );
  });
});
