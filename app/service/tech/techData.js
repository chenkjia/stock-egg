'use strict';
const Service = require('egg').Service;
const { EMA, KDJ } = require('./math');
const { macd } = require('ta-math');
const { slice, round, sum, zipWith } = require('lodash');

const maCompute = (dayline, index, num) => {
  if (!dayline[index - num]) return null;
  const list = slice(dayline, index - num + 1, index + 1);
  return round(sum(list, 'close') / num, 3);
};
const emaCompute = (closeArray, days) => {
  return closeArray.reduce((result, item, index) => {
    const emaItem = index === 0 ? item : EMA(result[result.length - 1], item, days);
    return [ ...result, emaItem ];
  }, []);
};
const maFormatter = dayline => {
  const ema20Array = emaCompute(dayline, 20);
  const ema60Array = emaCompute(dayline, 60);
  const ema120Array = emaCompute(dayline, 120);
  return dayline.map((item, index) => {
    const ma20 = maCompute(dayline, index, 20);
    const ma60 = maCompute(dayline, index, 60);
    const ma120 = maCompute(dayline, index, 120);
    const ema20 = round(ema20Array[index], 3);
    const ema60 = round(ema60Array[index], 3);
    const ema120 = round(ema120Array[index], 3);
    return {
      ma20,
      ma60,
      ma120,
      ema20,
      ema60,
      ema120,
      bma20: ema20 - ma20,
      bma60: ema60 - ma60,
      bma120: ema120 - ma120,
      bias20: ma20 ? round((item - ma20) / ma20 * 100, 3) : null,
      bias60: ma60 ? round((ma60 - ma20) / ma60 * 100, 3) : null,
      bias120: ma120 ? round((ma120 - ma60) / ma120 * 100, 3) : null,
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
  const closeArray = techDayline.map(({ adj }) => adj.close);
  // const kdjArray = techDayline.map(({ orgin }) => ([ orgin.high, orgin.low, orgin.close ]));
  // const baseData = baseFormat(kdjArray);
  const maData = maFormatter(closeArray);
  // const macdData = macdFormat(closeArray);
  // const kdjData = kdjFormat(kdjArray);
  // const tech = zipWith(techDayline, baseData, maData, macdData, kdjData, ({ date }, base, ma, macd, kdj) => ({
  const tech = zipWith(techDayline, maData, ({ date }, ma) => ({
    date,
    // base,
    ma,
    // ema,
    // macd,
    // kdj,
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
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000001' }, select: 'code' });
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
