const generateError = (msg, statusCode) => {
  const error = new Error(msg);
  error.statusCode = statusCode;
  return error;
};

export default generateError;