'use strict';
module.exports = app => {
  const { Schema, model } = app.mongoose;
  const CommonSchema = new Schema({
  });
  return model('Common', CommonSchema, 'common');
};
