import ApiError from "../errors/ApiError";

const notFoundVariable = (variable, variableName) => {
  if (!variable) {
    throw new ApiError(
      `Not Found ${variableName}`,
      400,
      `${variableName} Not Found.`
    );
  }
};

const noExistVariable = (variable, variableName) => {
  if (!variable) {
    throw new ApiError(
      `Does not exist ${variableName}`,
      400,
      `${variableName} does not exist.`
    );
  }
};

module.exports = { noExistVariable, notFoundVariable };
