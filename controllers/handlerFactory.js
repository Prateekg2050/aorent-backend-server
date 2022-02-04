import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // returns updated document instead of old document
      new: true,
      // run the validators again
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

const getOne = (Model, popOptions, selectOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

const getAll = (Model, filterOptions) =>
  asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // hack for get under review users
    if (filterOptions) features.query.find(filterOptions);

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc },
    });
  });

export { getAll, getOne, deleteOne, updateOne, createOne };
