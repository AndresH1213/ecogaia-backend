/* asyncWrapper is used to avoid the try catch sintax in every controller asynchronous
function, recives the controller function as a callback and returns right away another function.
This function has access to the req, res and next by default, since at the end of the day is the 
function that express takes in the route handling, then req, res and next are passed to the fn 
callback for his functionality */
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = asyncWrapper;
