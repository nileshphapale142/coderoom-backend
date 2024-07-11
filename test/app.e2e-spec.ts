import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from '../src/auth/dto';
import { AddStudentDTO, CreateCourseDTO } from 'src/course/dto';
import { CreateTestDTO } from 'src/test/dto';
import { NewQuestionDTO } from 'src/question/dto';
import { NewSubmisionDTO } from 'src/submission/dto';

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

      it('create teacher virgo', () => {
        const dto: SignUpDto = {
          name: 'virgo',
          email: 'virgo@gmail.com',
          password: '123',
          isTeacher: true,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201)
          .stores('virgoAt', 'access_token');
      });

      it('create student corona', () => {
        const dto: SignUpDto = {
          name: 'corono',
          email: 'corono@gmail.com',
          password: '123',
          isTeacher: true,
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201)
          .stores('coronoAt', 'access_token');
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

      it('create test with current timings', () => {
        const currTime = new Date()
          .toLocaleString()
          .replace(/\//g, '-');
        const dto = {
          name: 'Test 2',
          languages: ['Cpp', 'C'],
          evaluationScheme: 'static',
          visibility: 'private',
          courseId: '$S{course1Id}',
          date: '2024-07-11',
          startTime: '13:00',
          endTime: '23:00',
        };

        return pactum
          .spec()
          .post('/test/new')
          .withBody(dto)
          .withBearerToken('$S{adamAt}')
          .expectStatus(201)
          .stores('test2Id', 'test.id');
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
          .expectStatus(200);
      });
    });

    describe('Edit test', () => {
      it.todo('edit test info');
    });
  });

  describe('Question', () => {
    describe('Create', () => {
      const dto: NewQuestionDTO = {
        name: 'Smallest number',
        description: `
          Given an array of integers find out the smallest element in it.

          Inputs:
          First of line of testcaes is t: number of testCases, 
          next line contains n: size of array,
          next line contains nums array: n space separated integers.

          Ouput: 
          Print minimum element for each test case in a new line.

          Constraints:
          1 <= t <= 100
          1 <= n <= 100
          -100 <= nums[i] <= 100
          `,
        points: 100,
        testCases: btoa(`
          2
          4
          1 2 3 4
          5
          5 4 3 2 1
          `),
        exampleTestCases: [
          {
            input: `
              1
              1
              `,
            ouput: '1',
            explaination: '1 is the minimum element',
          },
          {
            input: `
              3
              4 2 5`,
            ouput: '2',
            explaination: '2 is the smallest element',
          },
        ],
        testId: 1,
        solutionCode: {
          language: 'cpp',
          code: btoa(
            `#include <bits/stdc++.h>
using namespace std;           

int main() {
  int t;
  cin >> t;
  while (t--) {
    int n;
    cin >> n;
    vector<int> nums;
    for (int i = 0; i < n; i ++) {
      int temp;
      cin >> temp;
      nums.push_back(temp);
    }
    cout << *min_element(nums.begin(), nums.end()) << endl;
  }

  return 0;
}`,
          ),
        },
      };

      it('Unauthorized: someone who does not created test', () => {
        return pactum
          .spec()
          .post('/question/new')
          .withBearerToken('$S{ursaMajAt}')
          .withBody({ ...dto, testId: '$S{test1Id}' })
          .expectStatus(403);
      });

      it('Create a question', () => {
        return pactum
          .spec()
          .post('/question/new')
          .withBearerToken('$S{adamAt}')
          .withBody({ ...dto, testId: '$S{test1Id}' })
          .expectStatus(201)
          .stores('que1Id', 'question.id')
          .withRequestTimeout(100000);
      });

      it('Create a question in test 2', () => {
        return pactum
          .spec()
          .post('/question/new')
          .withBearerToken('$S{adamAt}')
          .withBody({ ...dto, testId: '$S{test2Id}' })
          .expectStatus(201)
          .stores('que2Id', 'question.id')
          .withRequestTimeout(100000);
      });
    });

    describe('Get', () => {
      it('Unauthorized: teacher', () => {
        return pactum
          .spec()
          .get('/question/$S{que1Id}')
          .withBearerToken('$S{virgoAt}')
          .expectStatus(403);
        // .inspect();
      });

      it('Unauthorized: student', () => {
        return pactum
          .spec()
          .get('/question/$S{que1Id}')
          .withBearerToken('$S{coronoAt}')
          .expectStatus(403);
        // .inspect();
      });

      it('Get question: teacher', () => {
        return pactum
          .spec()
          .get('/question/$S{que1Id}')
          .withBearerToken('$S{adamAt}')
          .expectStatus(200);
        // .inspect();
      });

      it('Get question: student', () => {
        return pactum
          .spec()
          .get('/question/$S{que1Id}')
          .withBearerToken('$S{ursaMajAt}')
          .expectStatus(200);
        // .inspect();
      });
    });

    describe('Edit', () => {
      it.todo('Edit question');
    });
  });

  describe('Submission', () => {
    describe('Create submission', () => {
      it('should not accepet the submission: late ', () => {
        const dto: NewSubmisionDTO = {
          code: {
            language: 'cpp',
            code: btoa(
              `#include <bits/stdc++.h>
using namespace std;           

int main() {
  int t;
  cin >> t;
  while (t--) {
    int n;
    cin >> n;
    vector<int> nums;
    for (int i = 0; i < n; i ++) {
      int temp;
      cin >> temp;
      nums.push_back(temp);
    }
    cout << *min_element(nums.begin(), nums.end()) << endl;
  }

  return 0;
}`,
            ),
          },
          questionId: 1,
        };

        return pactum
          .spec()
          .post('/submission/new')
          .withBearerToken('$S{ursaMajAt}')
          .withBody({
            ...dto,
            questionId: '$S{que1Id}',
          })
          .expectStatus(403)
          .withRequestTimeout(5000);
      });

      it('should create a submission', () => {
        const dto: NewSubmisionDTO = {
          code: {
            language: 'cpp',
            code: btoa(
              `#include <bits/stdc++.h>
using namespace std;           

int main() {
  int t;
  cin >> t;
  while (t--) {
    int n;
    cin >> n;
    vector<int> nums;
    for (int i = 0; i < n; i ++) {
      int temp;
      cin >> temp;
      nums.push_back(temp);
    }
    cout << *min_element(nums.begin(), nums.end()) << endl;
  }

  return 0;
}`,
            ),
          },
          questionId: 1,
        };

        return pactum
          .spec()
          .post('/submission/new')
          .withBearerToken('$S{ursaMajAt}')
          .withBody({
            ...dto,
            questionId: '$S{que2Id}',
          })
          .expectStatus(201)
          .withRequestTimeout(5000);
      });
    });

    describe('Get submission', () => {
      it.todo('should get a submission');
    });
  });
});
