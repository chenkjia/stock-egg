'use strict';
module.exports = {
  // 日期
  date: Date,
  // 均线系统
  ma: {
    ma5: Number,
    ma10: Number,
    ma30: Number,
    ma60: Number,
    ma120: Number,
    ma240: Number,
    bias10: Number,
    bias30: Number,
    bias60: Number,
  },
  // macd系统
  macd: {
    diff: Number,
    dea: Number,
    bar: Number,
  },
  // kdj系统
  kdj: {
    k: Number,
    d: Number,
    j: Number,
  },
  // 标识
  mark: [{
    // 标识名称
    name: String,
    // 标识来自哪个系统
    system: String,
  }],
  // 信号
  sign: [{
    // 信号名称
    name: String,
    // 买入或卖出信号
    type: String,
    // 来自哪个系统
    system: String,
    // 信号强度
    intensity: Number,
  }],
};
