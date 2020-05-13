'use strict';
const priceModel = {
  // 开盘价
  open: Number,
  // 收盘价
  close: Number,
  // 最高
  high: Number,
  // 最低
  low: Number,
  // 昨收价
  pre_close: Number,
};
module.exports = {
  // 交易日期
  date: Date,
  // 涨跌幅
  percent: Number,
  // 涨跌额
  change: Number,
  // 成交量（手）
  vol: Number,
  // 成交额（千元）
  amount: Number,
  // 复权因子
  adj_factor: Number,
  // 原始价格
  orgin: priceModel,
  // 前复权价格
  adj: priceModel,
};
