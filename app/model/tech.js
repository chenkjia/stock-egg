'use strict';
module.exports = {
  // 日期
  date: Date,
  // 顶底判断
  base: {
    isVertex: Boolean,
    isNadir: Boolean,
    isVirtualVertex: Boolean,
    isVirtualNadir: Boolean,
  },
  // 均线系统
  ma: {
    ma20: Number,
    ma60: Number,
    ma120: Number,
    ema20: Number,
    ema60: Number,
    ema120: Number,
    bma20: Number,
    bma60: Number,
    bma120: Number,
    bias20: Number,
    bias60: Number,
    bias120: Number,
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
  mark: Array,
};
