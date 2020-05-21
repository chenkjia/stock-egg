'use strict';
const Service = require('egg').Service;
// const { slice, findLast } = require('lodash');
const signFormat = (dayline, tech) => {
  return tech.reduce((result, current, index) => {
    if (result.stage === 'low') {
      if (current.mark.includes('KDJGoldenCross')) {
        return {
          ...result,
          sign: [ ...result.sign, {
            date: current.date,
            type: 'BUY',
            name: 'KDJSecondGoldenCross',
            system: 'KDJ',
          }],
        };
      }
      if (current.kdj.k > 20) {
        return {
          ...result,
          stage: '',
        };
      }
      return result;
    }
    if (current.mark.includes('KDJLowGoldenCross')) {
      return {
        ...result,
        stage: 'low',
      };
    }
    return result;
  }, {
    stage: '',
    sign: [],
  });
};

class TechSignService extends Service {
  /**
  * @name init
  * @description 信号数据收集
  * @return {SuccessCallback} 数据库执行结果
  */
  async init() {
    // 获取所有股票代码
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000004' }, select: 'code' });
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行每个股票的技术指标初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.TechSignInitOfOneStock(stock);
      console.log(`完成获取${stock.code}信号初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name TechSignInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async TechSignInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline tech' });
    const { sign } = signFormat(stock.dayline.reverse(), stock.tech.reverse());
    return await this.ctx.service.stock.checkAndUpdateSign(stock, sign);
  }
}
module.exports = TechSignService;
