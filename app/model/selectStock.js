'use strict';
module.exports = app => {
  const { Schema, model } = app.mongoose;
  const SelectStockSchema = new Schema({
    // 股票唯一码
    code: String,
    // 最高价与最低价的比值
    percent: Number,
  });
  SelectStockSchema.index({ code: 1 });
  return model('SelectStock', SelectStockSchema, 'selectStock');
};
