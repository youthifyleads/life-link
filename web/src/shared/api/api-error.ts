import axios from "axios";

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  field_errors?: Record<string, string[]>;
  correlation_id?: string;
}

interface ApiErrorOptions {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  correlationId?: string;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;
  readonly correlationId?: string;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
    this.correlationId = options.correlationId;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;

    return new ApiError(
      payload?.message ?? "The server could not complete the request.",
      {
        status: error.response?.status,
        code: payload?.code,
        fieldErrors: payload?.field_errors,
        correlationId: payload?.correlation_id,
      },
    );
  }

  return new ApiError("An unexpected error occurred. Please try again.");
}
