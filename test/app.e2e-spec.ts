import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Sign up', () => {
      it('should throw error empty email', () => {
        const dto: SignUpDto = {
          name: 'Adam warlock',
          email: '',
          password: '123',
          isTeacher: true,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error no body', () => {
        return pactum.spec().post(`/auth/signup`).expectStatus(400);
      });

      it('should sign up', () => {
        const dto: SignUpDto = {
          name: 'Adam warlock',
          email: 'adam@gmail.com',
          password: '123',
          isTeacher: true,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign in', () => {
      it('should throw error empty email', () => {
        const dto: SignInDto = {
          email: '',
          password: '123',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error no body', () => {
        return pactum.spec().post(`/auth/signin`).expectStatus(400);
      });

      it('should throw error incorrect password', () => {
        const dto: SignInDto = {
          email: 'adam@gmail.com',
          password: '1234',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403);
      });

      it('should sign in', () => {
        const dto: SignInDto = {
          email: 'adam@gmail.com',
          password: '123',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token')
      });
    });
  });

  describe('User', () => {
    describe('Get home page', () => {
      it('should throw err no access_token', () => {
        return pactum
          .spec()
          .get('/user/getCourses')
          .expectStatus(401);
      });

      it('should return all courses', () => {
        return pactum
          .spec()
          .get('/user/getCourses')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
      });
    });
  });

  describe('Course', () => {
    describe('Create course', () => {
      it.todo('should create new course ');
    });
    describe('Add student', () => {
      it.todo('should join a student to a cousrse');
    });
    describe('Get course', () => {
      it.todo('should get course info');
    });
    describe('Get leaderboard', () => {
      it.todo('should get course leaderboard');
    });
    describe('Edit course', () => {
      it.todo('should edit course info');
    });
  });

  describe('Test', () => {
    describe('New Test', () => {
      it.todo('should create new test in a course');
    });
    describe('Get test', () => {
      it.todo('should get test info alongside question list');
    });
    describe('Get leaderboard', () => {
      it.todo('should get test leaderboard');
    });
    describe('Get submissions', () => {
      it.todo('shoudl get test submissions');
    });
  });
});
