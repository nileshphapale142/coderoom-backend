import { Injectable } from '@nestjs/common';
import { env } from '../../configs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs';
import { CreateSubmissionDTO, GetSubmissionDTO } from './dto';

@Injectable()
export class Judge0Service {
  constructor(private readonly httpService: HttpService) {}

  async createSubmission(dto: CreateSubmissionDTO) {
    try {
      const data = await lastValueFrom(
        this.httpService
          .post(
            `https://${env.JUDGE0.HOST}/submissions/?base64_encoded=true&wait=true`,
            dto,
            {
              headers: {
                'x-rapidapi-key': env.JUDGE0.KEY,
                'x-rapidapi-host': env.JUDGE0.HOST,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getSubmission(dto: GetSubmissionDTO) {
    try {
      const data = await lastValueFrom(
        this.httpService.get(
          `https://${env.JUDGE0.HOST}/submissions/${dto.token}`,
          {
            headers: {
              'x-rapidapi-key': env.JUDGE0.KEY,
              'x-rapidapi-host': env.JUDGE0.HOST,
            },
          },
        ),
      );
      return data;
    } catch (err) {
      throw err;
    }
  }

  async about() {
    try {
      const data = await lastValueFrom(
        this.httpService
          .get(`https://${env.JUDGE0.HOST}/about`, {
            headers: {
              'x-rapidapi-key': env.JUDGE0.KEY,
              'x-rapidapi-host': env.JUDGE0.HOST,
            },
          })
          .pipe(map((res) => res.data)),
      );

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getLanguages() {
    try {
      const data = await lastValueFrom(
        this.httpService.get(`https://${env.JUDGE0.HOST}/languages`, {
          headers: {
            'x-rapidapi-key': env.JUDGE0.KEY,
            'x-rapidapi-host': env.JUDGE0.HOST,
          },
        }),
      );

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getLanguage(id: number) {
    try {
      const data = await lastValueFrom(
        this.httpService.get(
          `https://${env.JUDGE0.HOST}/language/${id}`,
          {
            headers: {
              'x-rapidapi-key': env.JUDGE0.KEY,
              'x-rapidapi-host': env.JUDGE0.HOST,
            },
          },
        ),
      );

      return data;
    } catch (err) {
      throw err;
    }
  }

  async getStatuses() {
    try {
      const data = await lastValueFrom(
        this.httpService.get(`https://${env.JUDGE0.HOST}/statuses`, {
          headers: {
            'x-rapidapi-key': env.JUDGE0.KEY,
            'x-rapidapi-host': env.JUDGE0.HOST,
          },
        }),
      );

      return data;
    } catch (err) {
      throw err;
    }
  }
}
