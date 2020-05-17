'use strict';
const Service = require('egg').Service;

const kdjFormat = (current, last) => {
  const c = current.kdj;
  const l = last.kdj;
  const mark = [];
  if (c.k > c.d && l.k <= l.d) {
    mark.push('KDJGoldenCross');
    if (c.d < 20) {
      mark.push('KDJLowGoldenCross');
    } else if (c.d > 80) {
      mark.push('KDJHighGoldenCross');
    }
  }
  if (c.k < c.d && l.k >= l.d) {
    mark.push('KDJDeathCross');
    if (c.d < 20) {
      mark.push('KDJLowDeathCross');
    } else if (c.d > 80) {
      mark.push('KDJHighDeathCross');
    }
  }
  return {
    ...current,
    mark,
  };
};

const markFormat = tech => {
  return tech.reverse().map((item, index) => {
    if (index > 0) {
      return kdjFormat(item, tech[index - 1]);
    }
    return item;
  }).reverse();
};

class TechMarkService extends Service {
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
      await this.TechMarkInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标标识初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name TechMarkInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async TechMarkInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code tech' });
    const tech = markFormat(stock.tech);
    return await this.ctx.service.stock.checkAndUpdateTech(stock, tech);
  }
}
module.exports = TechMarkService;
