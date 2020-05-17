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
    ma5: Number,
    ma10: Number,
    ma20: Number,
    ma30: Number,
    ma60: Number,
    ma120: Number,
    ma240: Number,
    bias5: Number,
    bias10: Number,
    bias20: Number,
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
  mark: Array,
};
