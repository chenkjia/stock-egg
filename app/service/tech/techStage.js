'use strict';
const Service = require('egg').Service;
const { slice, maxBy, minBy, findIndex } = require('lodash');

// 找出拐点
const pointFormat = (dayline, day) => {
  const tmp = dayline.reduce((result, item, index) => {
    const part = slice(dayline, index >= day ? index - day : 0, index + day > dayline.length ? dayline.length : index + day);
    const max = maxBy(part, ({ orgin }) => orgin.high);
    const min = minBy(part, ({ orgin }) => orgin.low);
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
  middle: 30,
  small: 5,
};
const stageFormat = (dayline, scale = 'large') => {
  const points = pointFormat(dayline, scaleDay[scale]);
  return points.map((point, index) => {
    const nextPoint = points[index + 1] ? points[index + 1] : {
      date: dayline[dayline.length - 1].date,
      price: dayline[dayline.length - 1].orgin.close,
    };
    const start_index = findIndex(dayline, [ 'date', point.date ]);
    const end_index = findIndex(dayline, [ 'date', nextPoint.date ]);
    if (start_index === end_index) return null;
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
      children: scale === 'large' ? stageFormat(slice(dayline, start_index, end_index), 'middle') : [],
    };
  }).filter(item => item);
};

class TechStageService extends Service {
  /**
  * @name init
  * @description 技术指标初始化
  * @return {SuccessCallback} 数据库执行结果
  */
  async init() {
    // 获取所有股票代码
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000158' }, select: 'code' });
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行每个股票的技术指标初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.TechStageInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标标识初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name TechStageInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async TechStageInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const dayline = stock.dayline.reverse();
    const stages = stageFormat(dayline);
    // for (let i = 0; i < dayline.length; i++) {
    //   const day = dayline[i];
    //   const stages = stageFormat(slice(dayline, 0, i));
    //   const lastStage = stages[stages.length - 1];
    //   if (lastStage && lastStage.type === 'rise' && lastStage.children.length === 3) {
    //     const lastFailStage = stages[stages.length - 2];
    //     if (lastFailStage && lastFailStage.children[lastFailStage.children.length - 2] && lastFailStage.children[lastFailStage.children.length - 2].start_price < lastStage.children[0].end_price) {
    //       console.log(day.date);
    //     }
    //   }
    //   console.log(`完成第${i}天测试`);
    // }
    // return stages;
    return await this.ctx.service.stock.checkAndUpdateStage(stock, stages);
  }
}
module.exports = TechStageService;
