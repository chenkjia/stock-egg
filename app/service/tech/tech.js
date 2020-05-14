'use strict';
const Service = require('egg').Service;
// const { MA } = require('./math');
const { macd } = require('ta-math');
const { slice, round, sum, zipWith } = require('lodash');

const maCompute = (dayline, index, num) => {
  if (!dayline[index - num]) return null;
  const list = slice(dayline, index - num + 1, index + 1);
  return round(sum(list, 'close') / num, 3);
};
const maFormatter = dayline => {
  return dayline.map((item, index) => {
    const ma5 = maCompute(dayline, index, 5);
    const ma10 = maCompute(dayline, index, 10);
    const ma20 = maCompute(dayline, index, 20);
    const ma30 = maCompute(dayline, index, 30);
    const ma60 = maCompute(dayline, index, 60);
    const ma120 = maCompute(dayline, index, 120);
    const ma240 = maCompute(dayline, index, 240);
    return {
      ma5,
      ma10,
      ma20,
      ma30,
      ma60,
      ma120,
      ma240,
      bias5: round((item - ma5) / ma5 * 100, 3),
      bias10: round((item - ma10) / ma10 * 100, 3),
      bias20: round((item - ma20) / ma20 * 100, 3),
      bias30: round((item - ma30) / ma30 * 100, 3),
      bias60: round((item - ma60) / ma60 * 100, 3),
    };
  });
};

const macdFormat = closeArray => {
  const { line, signal, hist } = macd(closeArray);
  return zipWith(line, signal, hist, (diff, dea, bar) => ({
    diff: round(diff, 3),
    dea: round(dea, 3),
    bar: round(bar, 3),
  }));
};
const techFormat = dayline => {
  const techDayline = dayline.reverse();
  const closeArray = techDayline.map(({ orgin }) => orgin.close);
  const ma = maFormatter(closeArray);
  const macdData = macdFormat(closeArray);
  const tech = zipWith(techDayline, ma, macdData, ({ date }, ma, macd) => ({
    date,
    ma,
    macd,
  }));
  return tech.reverse();
};
class TechService extends Service {
  /**
  * @name start
  * @description 技术指标初始化
  * @return {SuccessCallback} 初始化执行结果
  */
  async start() {
    const techCallback = await this.techInit();
    return {
      techCallback,
    };
  }
  /**
  * @name techInit
  * @description 技术指标初始化
  * @return {SuccessCallback} 数据库执行结果
  */
  async techInit() {
    // 获取所有股票代码
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行每个股票的技术指标初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.techInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name techInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async techInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const tech = techFormat(stock.dayline);
    return await this.ctx.service.stock.checkAndUpdateTech(stock, tech);
  }
}
module.exports = TechService;
