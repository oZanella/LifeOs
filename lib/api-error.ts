// Thrown by data/validation code; its message is safe to show to the user.
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
