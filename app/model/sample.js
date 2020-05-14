'use strict';
module.exports = app => {
  const { Schema, model } = app.mongoose;
  const SampleSchema = new Schema({
    // 股票唯一码
    code: String,
    // 买点价格
    buy_price: Number,
    // 买点日期
    buy_date: Date,
    // 卖点价格
    sell_price: Number,
    // 卖点日期
    sell_date: Date,
    // 涨幅
    percent: Number,
    // 持有天数
    days: Number,
    // 是否成功
    isSuccess: Boolean,
  });
  SampleSchema.index({ code: 1 });
  SampleSchema.index({ code: 1, days: 1 });
  SampleSchema.index({ code: 1, isSuccess: 1 });
  return model('Sample', SampleSchema, 'sample');
};
