import ApiError from "../errors/ApiError";

const checkLotsOfRequiredField = (fields) => {
  fields.forEach(({ field, fieldName }) => {
    if (!field) {
      throw new ApiError(`${fieldName} Required`, 400, `${fieldName} Required`);
    }
  });
};

const checkRequiredField = (field, fieldName) => {
  if (!field) {
    throw new ApiError(`${fieldName} Required`, 400, `${fieldName} Required`);
  }
};

module.exports = { checkLotsOfRequiredField, checkRequiredField };
