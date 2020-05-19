'use strict';

// const moment = require('moment');
const Service = require('egg').Service;
const moment = require('moment');
const { pick, zipObject, keyBy, difference, mapValues } = require('lodash');

const daylineFormatter = (data, first_factor) => {
  const adj = keyBy(data[1].items, 1);
  const { items, fields } = data[0];
  const priceFields = [ 'open', 'close', 'high', 'low', 'pre_close' ];
  const baseFields = difference(fields, priceFields);
  return items.map(item => {
    const obj = zipObject(fields, item);
    const base = pick(obj, baseFields);
    const orgin = pick(obj, priceFields);
    const adj_factor = adj[obj.trade_date] ? adj[obj.trade_date][2] : 1;
    const factor = adj_factor / first_factor;
    return {
      ...base,
      percent: obj.pct_chg,
      adj_factor,
      orgin,
      adj: mapValues(orgin, val => val * factor),
      date: moment(obj.trade_date, 'YYYYMMDD').toDate(),
    };
  });
};
// const qfqFormatter = dayline => {
//   const adj_factor = dayline[0].adj_factor;
//   return dayline.map(item => {
//     return {
//       date: item.date,
//       vol: item.vol,
//       pct_chg: item.pct_chg,
//       open: item.open * item.adj_factor / adj_factor,
//       close: item.close * item.adj_factor / adj_factor,
//       high: item.high * item.adj_factor / adj_factor,
//       low: item.low * item.adj_factor / adj_factor,
//       amount: item.amount * item.adj_factor / adj_factor,
//     };
//   });
// };

// const maCompute = (dayline, index, num) => {
//   if (!dayline[index + num]) return null;
//   const list = slice(dayline, index, index + num);
//   return round(sumBy(list, 'close') / num, 3);
// };
// const maFormatter = dayline => {
//   return dayline.map((item, index) => {
//     const ma20 = maCompute(dayline, index, 20);
//     return {
//       ...item,
//       ma10: maCompute(dayline, index, 10),
//       ma20,
//       bias20: round((item.close - ma20) / ma20 * 100, 3),
//       ma60: maCompute(dayline, index, 60),
//       ma120: maCompute(dayline, index, 120),
//       ma250: maCompute(dayline, index, 250),
//     };
//   });
// };
// const macdFormatter = (adj, dayline) => {
//   const m = macd(dayline.reverse().map(({ close }) => close));
//   const diff = m.line.reverse();
//   const dea = m.signal.reverse();
//   const bar = m.hist.reverse();
//   return adj.map((item, index) => {
//     return {
//       ...item,
//       macd: {
//         diff: round(diff[index], 3),
//         dea: round(dea[index], 3),
//         bar: round(bar[index], 3),
//       },
//     };
//   });
// };

class DaylineService extends Service {
  /**
  * @name daylineInit
  * @description 执行日线数据初始化
  * @return {SuccessCallback} 数据库执行结果
  */
  async daylineInit() {
    // 获取所有没有日线的股票数据
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '002988' }, select: 'code' });
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行每个股票的日线初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      const daylineInitStatus = await this.daylineOfOneStockInit(stock);
      console.log(daylineInitStatus);
      console.log(`完成获取${stock.code}日线数据，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成日线数据初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  async daylineOfOneStockInit({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const start = stock.dayline.length ? moment(stock.dayline[0].date).add(1, 'day').format('YYYYMMDD') : undefined;
    const data = await Promise.all([
      this.getDataOfOneStockRecursive(stock, 'daily', start),
      this.getDataOfOneStockRecursive(stock, 'adj_factor', start),
    ]);
    const adj_factor = stock.dayline.length ? stock.dayline[stock.dayline.length - 1].adj_factor : data[1].items.length ? data[1].items[data[1].items.length - 1][2] : 1;
    const dayline = daylineFormatter(data, adj_factor);
    // // 将单个股票的所有历史日线数据批量插入数据库
    return await this.updateDayline(stock, dayline);
  }
  /**
  * @name getDataOfOneStockRecursive
  * @description 递归抓取单个股票的数据
  * @param {Object} stock 股票
  * @param {String} api_name API名称（daily或adj_factor）
  * @param {String} start_date 开始日期
  * @param {String} end_date 结束日期
  * @return {Array} data
  */
  async getDataOfOneStockRecursive(stock, api_name, start_date, end_date) {
    const { fields, items } = await this.getDataOfOneStock(stock, api_name, start_date, end_date || moment().format('YYYYMMDD'));
    if (items.length) {
      const end_date = moment(items[items.length - 1][1], 'YYYYMMDD').subtract(1, 'day').format('YYYYMMDD');
      const oldData = await this.getDataOfOneStockRecursive(stock, api_name, start_date, end_date);
      return {
        fields,
        items: items.concat(oldData.items),
      };
    }
    return { fields, items };
  }
  /**
  * @name getDataOfOneStock
  * @description 通过时间范围抓取单个股票的数据
  * @param {Object} stock 股票
  * @param {String} api_name API名称（daily或adj_factor）
  * @param {String} start_date 开始日期
  * @param {String} end_date 结束日期
  * @return {Array} dayline
  */
  async getDataOfOneStock(stock, api_name, start_date, end_date) {
    // 抓取单个股票的历史数据
    const ctx = this.ctx;
    const result = await ctx.curl('http://api.waditu.com', {
      method: 'POST',
      contentType: 'json',
      data: {
        api_name,
        token: '021aced2154517da19b6d76dca1f9fc02b8fdaa5aa1a8e43fee373fd',
        params: {
          ts_code: stock.code,
          start_date,
          end_date,
        },
      },
      dataType: 'json',
    });
    return result.data.data;
  }
  /**
  * @name updateDayline
  * @description 将单个股票的所有历史日线数据批量插入数据库
  * @param {Object} stock 股票
  * @param {Array} dayline 日线数据
  * @return {SuccessCallback} 数据库执行结果
  */
  async updateDayline(stock, dayline) {
    return await this.ctx.service.stock.checkAndUpdateDayline(stock, dayline);
  }
  // /**
  // * @name daylineAdj
  // * @description 为日线数据复权
  // * @return {SuccessCallback} 为日线数据复权执行结果
  // */
  // async daylineAdj() {
  //   // 获取所有没有日线的股票数据
  //   const stocks = await this.ctx.service.stock.index({ filter: { 'dayline.0': { $exists: 1 } }, select: 'code' });
  //   // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000001' }, select: 'code dayline' });
  //   // 循环执行每个股票的日线初始化
  //   for (let i = 0; i < stocks.length; i++) {
  //     const stock = stocks[i];
  //     const adj = await this.getDaylineAdjData(stock);
  //     const adjInitStatus = await this.ctx.service.stock.checkAndUpdateAdj(stock, adj);
  //     console.log(adjInitStatus);
  //     console.log(`完成${stock.code}日线数据复权，总完成${i + 1}个，共${stocks.length}个`);
  //   }
  //   console.log('完成日线数据复权');
  //   return {
  //     code: 0,
  //     message: 'success',
  //   };
  // }
  // /**
  // * @name daylineAdjOneStock
  // * @description 为单个股票日线数据复权
  // * @param {Object} stock 股票
  // * @return {SuccessCallback} 为日线数据复权执行结果
  // */
  // async getDaylineAdjData({ _id }) {
  //   const stock = await this.ctx.service.stock.show({ filter: { _id } });
  //   const qfq = qfqFormatter(stock.dayline);
  //   const ma = maFormatter(qfq);
  //   const macd = macdFormatter(ma, stock.dayline);
  //   return macd;
  // }
}

module.exports = DaylineService;

