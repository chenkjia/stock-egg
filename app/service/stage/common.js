'use strict';
const { slice, maxBy, minBy, findIndex } = require('lodash');
// 找出拐点
const pointFormat = (dayline, day) => {
  const tmp = dayline.reduce((result, item, index) => {
    if (index === dayline.length - 1) {
      return result;
    }
    const part = slice(dayline, index >= day ? index - day : 0, index + day > dayline.length ? dayline.length : index + day);
    const max = maxBy(part, 'orgin.high');
    const min = minBy(part, 'orgin.low');
    if (max.date === item.date) {
      return [ ...result, { type: 'vertex', date: item.date, price: item.orgin.high }];
    }
    if (min.date === item.date) {
      return [ ...result, { type: 'nadir', date: item.date, price: item.orgin.low }];
    }
    return result;
  }, []);
  // 找出顶点和底点
  return tmp.reduce((result, item, index) => {
    if (tmp[index - 1] && tmp[index - 1].type === item.type) {
      const last = result[result.length - 1];
      const current = item.type === 'vertex' ? maxBy([ item, last ], 'price') : minBy([ item, last ], 'price');
      last.price = current.price;
      last.date = current.date;
      return result;
    }
    return [ ...result, item ];
  }, []);
};
const scaleDay = {
  large: 120,
  middle: 20,
  small: 5,
};
const stageFormat = (dayline, scale = 'large') => {
  const points = pointFormat(dayline, scaleDay[scale]);
  return points.map((point, index) => {
    const nextPoint = points[index + 1] ? points[index + 1] : {
      date: dayline[dayline.length - 1].date,
      price: point.type === 'vertex' ? dayline[dayline.length - 1].orgin.low : dayline[dayline.length - 1].orgin.high,
    };
    const start_index = findIndex(dayline, [ 'date', point.date ]);
    const end_index = findIndex(dayline, [ 'date', nextPoint.date ]);
    // if (start_index === end_index) return null;
    return {
      scale,
      type: point.type === 'vertex' ? 'fail' : 'rise',
      start_date: point.date,
      start_price: point.price,
      start_index,
      end_date: nextPoint.date,
      end_price: nextPoint.price,
      end_index,
      multiple: nextPoint.price / point.price,
      days: end_index - start_index,
      children: index >= points.length - 3 && scale === 'large' ? stageFormat(slice(dayline, start_index, end_index + 1), 'middle') : scale === 'middle' ? stageFormat(slice(dayline, start_index, end_index + 1), 'small') : [],
    };
  }).filter(item => item);
};
const isStageSign = (stages, tech, dayline) => {
  // 如果趋势小于2，则返回错误
  if (stages.length < 2) {
    return false;
  }
  // 定义当前大趋势与上一个大趋势,与当前中趋势
  const currentStage = stages[stages.length - 1];
  // 当前趋势的子趋势为3个
  if (currentStage.children.length < 8) {
    return false;
  }
  // 定义当前中趋势
  const currentMiddleStage = currentStage.children[currentStage.children.length - 1];
  // 当前趋势与当前子趋势都为rise
  if (!(currentStage.type === 'fail' && currentMiddleStage.type === 'rise')) {
    return false;
  }
  const { ma } = tech[tech.length - 1];
  const { orgin } = dayline[dayline.length - 1];
  if (orgin.close < ma.ma5) return false;
  if (orgin.close < ma.ma10) return false;
  if (orgin.close < ma.ma20) return false;
  if (orgin.close < ma.ma30) return false;
  if (orgin.close < ma.ma60) return false;
  if (orgin.close < ma.ma120) return false;
  if (orgin.close < ma.ma240) return false;
  // if (currentMiddleStage.days > 3) {
  //   return false;
  // }
  // 定义当上上个中趋势
  // const lastMiddleStage = currentStage.children[currentStage.children.length - 3];
  // // 当前趋势的结束价格大于上上个子趋势的结束价格
  // if (currentMiddleStage.end_price < lastMiddleStage.end_price) {
  //   return false;
  // }
  // 当前趋势的开始价格大于上上个子趋势的开始价格
  // if (currentMiddleStage.start_price < lastMiddleStage.start_price) {
  //   return false;
  // }
  // const lastStage = stages[stages.length - 2];
  // const lastLargeStageLastStage = lastStage.children[lastStage.children.length - 1];
  // // 当前趋势的开始价格大于上个大级别最后一个子趋势的开始价格
  // if (currentMiddleStage.start_price < lastLargeStageLastStage.start_price) {
  //   return false;
  // }
  // 上上个子趋势的结束价格大于上个大级别最后一个子趋势的开始价格
  // if (lastMiddleStage.end_price < lastLargeStageLastStage.start_price) {
  //   return false;
  // }
  return true;
};
const isStageBackSign = stages => {
  // 如果趋势小于2，则返回错误
  if (stages.length < 2) {
    return false;
  }
  // 定义当前大趋势
  const currentStage = stages[stages.length - 1];
  // 当前趋势的子趋势为3个
  if (currentStage.type !== 'rise' || currentStage.children.length < 2) {
    return false;
  }
  // 定义当前中趋势
  const currentMiddleStage = currentStage.children[currentStage.children.length - 1];
  // 当前中趋势为上升，但子趋势超过1个，则不是回调
  if (currentMiddleStage.type === 'rise' && currentMiddleStage.children.length > 1) {
    return false;
  }
  // 定义当前小趋势
  const currentSmallStage = currentMiddleStage.children[currentMiddleStage.children.length - 1];
  // 当前中趋势为下降时，当前小趋势为上升或者当前中趋势的子趋势数量小于3，则不是回调
  if (currentMiddleStage.type === 'fail' && (currentSmallStage.type === 'rise' || currentMiddleStage.children.length < 3)) {
    return false;
  }
  return true;
};

module.exports = {
  stageFormat,
  isStageSign,
  isStageBackSign,
};
