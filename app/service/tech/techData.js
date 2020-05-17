'use strict';
const Service = require('egg').Service;
const { KDJ } = require('./math');
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
const baseFormat = baseArray => {
  return baseArray.map((item, index) => {
    if (index > 1 && index < baseArray.length - 1) {
      const i_0 = baseArray[index - 2];
      const i_1 = baseArray[index - 1];
      const i_2 = item;
      const i_3 = baseArray[index + 1];
      const i_4 = baseArray[index + 2];
      return {
        isVertex: i_4 ? i_1[0] > i_0[0] && i_2[0] > i_1[0] && i_2[0] > i_3[0] && i_3[0] > i_4[0] : false,
        isNadir: i_4 ? i_1[1] < i_0[1] && i_2[1] < i_1[1] && i_2[1] < i_3[1] && i_3[1] < i_4[1] : false,
        isVirtualVertex: i_1[0] > i_0[0] && i_2[0] > i_1[0] && i_2[0] > i_3[0],
        isVirtualNadir: i_1[1] < i_0[1] && i_2[1] < i_1[1] && i_2[1] < i_3[1],
      };
    }
    return {
      isVertex: false,
      isNadir: false,
      isVirtualVertex: false,
      isVirtualNadir: false,
    };

  });
};
const kdjFormat = kdjArray => {
  const { k, d, j } = KDJ(kdjArray);
  return zipWith(k, d, j, (k, d, j) => ({
    k: round(k, 3),
    d: round(d, 3),
    j: round(j, 3),
  }));
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
  const kdjArray = techDayline.map(({ orgin }) => ([ orgin.high, orgin.low, orgin.close ]));
  const baseData = baseFormat(kdjArray);
  const maData = maFormatter(closeArray);
  const macdData = macdFormat(closeArray);
  const kdjData = kdjFormat(kdjArray);
  const tech = zipWith(techDayline, baseData, maData, macdData, kdjData, ({ date }, base, ma, macd, kdj) => ({
    date,
    base,
    ma,
    macd,
    kdj,
  }));
  return tech.reverse();
};
class TechDataService extends Service {
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
      await this.TechDataInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name TechDataInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async TechDataInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const tech = techFormat(stock.dayline);
    return await this.ctx.service.stock.checkAndUpdateTech(stock, tech);
  }
}
module.exports = TechDataService;
