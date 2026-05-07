export class CliError extends Error {
  readonly exitCode = 1;
}

export class StrictError extends Error {
  readonly exitCode = 2;
}

export function isKnownError(error: unknown): error is CliError | StrictError {
  return error instanceof CliError || error instanceof StrictError;
}
