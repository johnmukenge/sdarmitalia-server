const News = require('./../models/newsModel');
const APIFeatures = require('./../utils/apiFeatures');

const getAllNews = async (req, res) => {
  try {
    // Execute the query
    console.log('req.query', req.query);
    const features = new APIFeatures(News.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const news = await features.query;

    // Send the response
    res.status(200).json({
      status: 'success',
      results: news.length,
      data: {
        news,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
const getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    console.log('errore', error);
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        news: news,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data received',
    });
  }
};
const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
const deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = {
  getAllNews,
  getNews,
  createNews,
  updateNews,
  deleteNews,
};
