export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.errorCode = null;
    this.debuggingTip = null;
  }
  setDebuggingTip(tip) {
    this.debuggingTip = tip;
    return this;
  }
  setErrorCode(code) {
    this.errorCode = code; // Client maps this to a friendly message
    return this;
  }
}
