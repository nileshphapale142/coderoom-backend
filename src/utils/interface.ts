export interface SubmissionStatus {
  id: number;
  description: string;
}

export interface SubmisionResult {
  stdout: string;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: SubmissionStatus;
}
