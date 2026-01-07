/**
 * @file catchAsync.js
 * @description Wrapper function to catch async errors in controllers
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Eliminates the need for try-catch blocks in async controller functions
 * by catching any errors and passing them to the error handling middleware
 *
 * @example
 * const getAllNews = catchAsync(async (req, res, next) => {
 *   const news = await News.find();
 *   res.json({ data: news });
 * });
 */

/**
 * Wraps async controller functions to catch errors
 * Automatically passes caught errors to the next middleware (error handler)
 *
 * @function catchAsync
 * @param {Function} fn - Async controller function to wrap
 * @returns {Function} Wrapped function that catches errors
 *
 * @example
 * // Without catchAsync (verbose):
 * const getNews = async (req, res) => {
 *   try {
 *     const news = await News.find();
 *     res.json(news);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 *
 * // With catchAsync (clean):
 * const getNews = catchAsync(async (req, res, next) => {
 *   const news = await News.find();
 *   res.json(news);
 * });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any rejected promises
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
