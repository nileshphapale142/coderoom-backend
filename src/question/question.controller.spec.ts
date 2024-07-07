import { Test } from '@nestjs/testing';
import { QuestionProvider } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from '@prisma/client';

describe('QuestionController', () => {
  let questionController: QuestionController;
  let questionProvider: QuestionProvider;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [QuestionProvider],
      controllers: [QuestionController],
    }).compile();

    questionProvider = moduleRef.get<QuestionProvider>(QuestionProvider);
    questionController = moduleRef.get<QuestionController>(QuestionController);
  });

  describe('create question', () => {
    it('should create a question', () => {
        let result:Promise<Question>
        jest.spyOn(questionProvider, 'createQuestion').mockImplementation(() => result)
        
    })
  })
});
