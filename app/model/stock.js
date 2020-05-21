'use strict';
const dayline = require('./dayline');
const tech = require('./tech');
// const stage = require('./stage');
module.exports = app => {
  const { Schema, model } = app.mongoose;
  const StockSchema = new Schema({
    // 股票名称
    name: String,
    // 股票唯一码
    code: String,
    // 股票代码
    symbol: String,
    // 所属区域
    area: String,
    // 所属行业
    industry: String,
    // 所属市场
    market: String,
    // 上市日期
    list_date: String,
    // 价格
    price: Number,
    // 涨跌幅
    percent: Number,
    // 涨跌额
    updown: Number,
    // 今开
    open: Number,
    // 昨收
    yestclose: Number,
    // 最高
    high: Number,
    // 最低
    low: Number,
    // 成交量
    volume: Number,
    // 成交额
    turnover: Number,
    // 市盈率
    pe: Number,
    // 流通市值
    mcap: Number,
    // 总市值
    tcap: Number,
    // 日线
    dayline: [ dayline ],
    // 技术指标
    tech: [ tech ],
    // 趋势
    stage: Array,
    // 信号
    sign: Array,
  });
  StockSchema.index({ code: 1 });
  StockSchema.index({ symbol: 1 });
  StockSchema.index({ code: 1, 'dayline.date': 1 });
  StockSchema.index({ code: 1, 'tech.date': 1 });
  StockSchema.index({ code: 1, 'sign.date': 1 });
  return model('Stock', StockSchema, 'stock');
};
