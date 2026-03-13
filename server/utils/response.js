// Response helper functions

const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, errors = null, statusCode = 400) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};

const validationErrorResponse = (res, errors) => {
  const formattedErrors = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: formattedErrors
  });
};

const serverErrorResponse = (res, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    message
  });
};

const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// API response wrapper for controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Standard API responses
const responses = {
  // Success responses
  created: (res, message, data) => successResponse(res, message, data, 201),
  updated: (res, message, data) => successResponse(res, message, data, 200),
  deleted: (res, message) => successResponse(res, message, null, 200),
  fetched: (res, message, data) => successResponse(res, message, data, 200),

  // Error responses
  badRequest: (res, message, errors) => errorResponse(res, message, errors, 400),
  unauthorized: (res, message) => unauthorizedResponse(res, message),
  forbidden: (res, message) => forbiddenResponse(res, message),
  notFound: (res, resource) => notFoundResponse(res, resource),
  conflict: (res, message) => errorResponse(res, message, null, 409),
  unprocessable: (res, message, errors) => errorResponse(res, message, errors, 422),
  serverError: (res, message) => serverErrorResponse(res, message)
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  asyncHandler,
  responses
};