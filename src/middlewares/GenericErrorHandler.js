import ApiError from "../errors/ApiError";

const GenericErrorHandler = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    console.error(err);
  }
  if (/\w+ validation failed: \w+/i.test(err.message)) {
    err.message = err.message.replace(/\w+ validation failed: \w+/i, "");
  }
  res.status(err.status || 500).json({
    status: err?.status,
    error: err?.message,
    code: err.code,
  });
};

export default GenericErrorHandler;
