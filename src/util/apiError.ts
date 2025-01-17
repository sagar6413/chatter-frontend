import { ProblemDetail } from "@/types/errors";

export class ApiError extends Error {
    constructor(
      public readonly problemDetail: ProblemDetail,
      public readonly originalError?: any
    ) {
      super(problemDetail.detail);
      this.name = 'ApiError';
    }
  
    get errorCode(): number {
      return this.problemDetail.errorCode;
    }
  
    get violations(): Record<string, string> | undefined {
      return this.problemDetail.violations;
    }
  
    get fieldErrors(): Record<string, string> | undefined {
      return this.problemDetail.errors;
    }
  }