
'use strict';
module.exports = {
  // 趋势大小
  scale: String,
  // 趋势类型，上涨或下跌
  type: String,
  // 趋势开始日期
  start_date: Date,
  // 趋势开始时的价格
  start_price: Number,
  // 趋势开始日在上一级趋势中的位置
  start_index: Number,
  // 趋势结束日期
  end_date: Date,
  // 趋势结束时的价格
  end_price: Number,
  // 趋势结束日在上一级趋势中的位置
  end_index: Number,
  // 趋势结束时上涨的倍数，趋势下跌时该数字为0-1之间
  multiple: Number,
  // 趋势持续天数
  days: Number,
  // 子趋势
  children: Array,
};
