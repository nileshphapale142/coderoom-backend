import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from '../src/auth/dto';
import { AddStudentDTO, CreateCourseDTO } from 'src/course/dto';
import { CreateTestDTO } from 'src/test/dto';
import { NewQuestionDTO } from 'src/question/dto';

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
          .expectStatus(201)
          .stores('adamAt', 'access_token');
      });

      it('sign up student ursa major', () => {
        const dto: SignUpDto = {
          name: 'Ursa Major',
          email: 'ursa@gmail.com',
          password: '123',
          isTeacher: false,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201)
          .stores('ursaMajAt', 'access_token');
      });

      it('create student ursa minor', () => {
        const dto: SignUpDto = {
          name: 'Ursa minor',
          email: 'ursamin@gmail.com',
          password: '123',
          isTeacher: false,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201)
          .stores('ursaMinAt', 'access_token');
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
          .stores('userAt', 'access_token');
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
          .expectStatus(200);
      });
    });
  });

  describe('Course', () => {
    const courseSchema = {
      type: 'object',
      properties: {
        course: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            code: {
              type: 'string',
            },
            teacher: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    };

    describe('Create course', () => {
      it('unauthorized: no token', () => {
        const dto: CreateCourseDTO = {
          name: 'Course 1',
          description: 'First course',
        };

        return pactum
          .spec()
          .post('/course/create')
          .withBody(dto)
          .expectStatus(401);
      });

      it('unauthorized: student', () => {
        const dto: CreateCourseDTO = {
          name: 'Course 1',
          description: 'First course',
        };

        return pactum
          .spec()
          .post('/course/create')
          .withBody(dto)
          .withBearerToken('$S{ursaMajAt}')
          .expectStatus(403);
      });

      it('should create new course', () => {
        const dto: CreateCourseDTO = {
          name: 'Course 1',
          description: 'First course',
        };

        return pactum
          .spec()
          .post('/course/create')
          .withBody(dto)
          .withBearerToken('$S{adamAt}')
          .expectStatus(201)
          .expectJsonSchema(courseSchema)
          .stores('course1Code', 'course.code')
          .stores('course1Id', 'course.id');
      });
    });

    describe('Add student', () => {
      it('wrong course code', () => {
        const dto: AddStudentDTO = {
          courseCode: 'dafda',
        };

        return pactum
          .spec()
          .post('/course/addStudent')
          .withBody(dto)
          .withBearerToken('$S{ursaMajAt}')
          .expectStatus(404);
      });

      it('ursa major to course 1', () => {
        const dto: AddStudentDTO = {
          courseCode: '$S{course1Code}',
        };

        return pactum
          .spec()
          .post('/course/addStudent')
          .withBody(dto)
          .withBearerToken('$S{ursaMajAt}')
          .expectStatus(201)
          .expectJsonSchema(courseSchema);
      });

      it('ursa minor to course 1', () => {
        const dto: AddStudentDTO = {
          courseCode: '$S{course1Code}',
        };

        return pactum
          .spec()
          .post('/course/addStudent')
          .withBody(dto)
          .withBearerToken('$S{ursaMinAt}')
          .expectStatus(201)
          .expectJsonSchema(courseSchema);
      });

      it('already joined', () => {
        const dto: AddStudentDTO = {
          courseCode: '$S{course1Code}',
        };

        return pactum
          .spec()
          .post('/course/addStudent')
          .withBody(dto)
          .withBearerToken('$S{ursaMinAt}')
          .expectStatus(201)
          .expectJsonSchema(courseSchema);
      });
    });

    describe('Get course', () => {
      it('course not found', () => {
        return pactum
          .spec()
          .get('/course/-1')
          .withBearerToken('$S{ursaMinAt}')
          .expectStatus(404);
      });

      it('get course info', () => {
        return pactum
          .spec()
          .get('/course/$S{course1Id}')
          .withBearerToken('$S{ursaMinAt}')
          .expectStatus(200);
      });

      it.todo('tests with correct structure');
    });

    describe('Get leaderboard', () => {
      it('should get course leaderboard', () => {
        return pactum
          .spec()
          .get('/course/$S{course1Id}/leaderboard')
          .withBearerToken('$S{ursaMinAt}')
          .expectStatus(200);
      });
    });

    describe('Edit course', () => {
      it.todo('should edit course info');
    });
  });

  describe('Test', () => {
    describe('New Test', () => {
      it('unauthorized: not course teacher', () => {
        const dto = {
          name: 'Test 1',
          languages: ['Cpp', 'C'],
          evaluationScheme: 'static',
          visibility: 'private',
          courseId: '$S{course1Id}',
          date: '2024-07-06',
          startTime: '12:00',
          endTime: '15:00',
        };

        return pactum
          .spec()
          .post('/test/new')
          .withBody(dto)
          .withBearerToken('$S{ursaMajAt}')
          .expectStatus(403);
      });

      it('course does not exist', () => {
        const dto: CreateTestDTO = {
          name: 'Test 1',
          languages: ['Cpp', 'C'],
          evaluationScheme: 'static',
          visibility: 'private',
          courseId: -1,
          date: '2024-07-06',
          startTime: '12:00',
          endTime: '15:00',
        };

        return pactum
          .spec()
          .post('/test/new')
          .withBody(dto)
          .withBearerToken('$S{adamAt}')
          .expectStatus(404);
      });

      it('create test in a course', () => {
        const dto = {
          name: 'Test 1',
          languages: ['Cpp', 'C'],
          evaluationScheme: 'static',
          visibility: 'private',
          courseId: '$S{course1Id}',
          date: '2024-07-06',
          startTime: '12:00',
          endTime: '15:00',
        };

        return pactum
          .spec()
          .post('/test/new')
          .withBody(dto)
          .withBearerToken('$S{adamAt}')
          .expectStatus(201)
          .stores('test1Id', 'test.id');
      });
    });

    describe('Get test', () => {
      it('test does not exist', () => {
        return pactum
          .spec()
          .get('/test/-1')
          .withBearerToken('$S{adamAt}')
          .expectStatus(404);
      });

      it('get test info', () => {
        return pactum
          .spec()
          .get('/test/$S{test1Id}')
          .withBearerToken('$S{adamAt}')
          .expectStatus(200);
      });
    });

    describe('Get leaderboard', () => {
      it('get leaderboard', () => {
        return pactum
          .spec()
          .get('/test/$S{test1Id}/leaderboard')
          .withBearerToken('$S{adamAt}')
          .expectStatus(200);
      });
    });

    describe('Get submissions', () => {
      it('get test submissions', () => {
        return pactum
          .spec()
          .get('/test/$S{test1Id}/submissions')
          .withBearerToken('$S{adamAt}')
          .expectStatus(200)  
      });
    });

    describe('Edit test', () => {
      it.todo('edit test info');
    });
  });

  describe('Question', () => {
    describe('Create', () => {
      it('Create a question', () => {


        const dto: NewQuestionDTO = {
          name: 'Two Sum',
          description: 'description',
          points: 100,
          testCases: 'enter a test cases (io) here',
          testId: 1,
          inputs: [
            { type: 'string', name: 'nums' },
            { type: 'int', name: 'n' },
          ],
          output: { type: 'string', name: 'nameNotNecessary' },
          solutionCode: {
            language: 'python',
            code: "print('Hello World')",
          },
        };

        return pactum
          .spec()
          .post('/question/new')
          .withBearerToken('$S{adamAt}')
          .withBody({ ...dto, testId: '$S{test1Id}' })
          .expectStatus(201)
          .inspect()
          .withRequestTimeout(20000);
      });

      it.todo('Get question');
      it.todo('Edit question');
    });
  });
});
