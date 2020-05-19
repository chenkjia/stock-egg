'use strict';
const CustomService = require('../common');
const { findLastIndex, findIndex, min } = require('lodash');


const sampleFormat = ({ sign, tech, dayline, code }) => {
  return sign.map(sign => {
    // 找出信号的位置
    const index = findIndex(tech, [ 'date', sign.date ]);
    // 通过信号的位置往前找出上一个低点，以其最低点为止损价
    const lastNadirIndex = findLastIndex(tech, (item, i) => i < index && item.base.isNadir);
    if (!dayline[lastNadirIndex]) {
      return {
        code,
        sign_date: sign.date,
        type: 'GIVEUP',
      };
    }
    const stopLoss = min([ dayline[lastNadirIndex].orgin.low, dayline[index].orgin.low, dayline[index + 1].orgin.low ]);
    // 通过信号的位置往后找一位，以其开盘价为买入价，并记录买入时间
    const buy_price = dayline[index + 1].orgin.open;
    const buy_date = dayline[index + 1].date;
    // if ((buy_price - stopLoss) / buy_price > 0.08) {
    //   return {
    //     code,
    //     sign_date: sign.date,
    //     type: 'GIVEUP',
    //   };
    // }
    // 通过买入的位置往后扫，
    let sell_price,
      sell_date,
      isSuccess,
      days;
    for (let i = index + 2; i <= index + 11; i++) {
      if (!dayline[i]) {
        return {
          code,
          sign_date: sign.date,
          type: 'GIVEUP',
        };
      }
      // 如果低位小于或等于止损价，则以其为卖出价，该交易失败
      if (dayline[i].orgin.low <= stopLoss) {
        sell_price = stopLoss;
        sell_date = dayline[i].date;
        isSuccess = false;
        days = i - index;
        break;
      }
      // 如果日期大于10天，则以其收盘价为卖出价，该交易失败
      if (i === index + 11) {
        sell_price = dayline[i].orgin.close;
        sell_date = dayline[i].date;
        isSuccess = false;
        days = i - index;
        break;
      }
      // 如果j值大于100，则以第二天收盘价卖出，该交易成功
      if (tech[i].kdj.j >= 100) {
        sell_price = dayline[i + 1].orgin.close;
        sell_date = dayline[i + 1].date;
        isSuccess = true;
        days = i - index;
        break;
      }
    }
    // 记录卖出时间，盈亏比
    return {
      code,
      sign_date: sign.date,
      stopLoss,
      buy_price,
      buy_date,
      sell_price,
      sell_date,
      isSuccess,
      days,
      percent: (sell_price - buy_price) / buy_price,
    };
  });
};

class SampleService extends CustomService {
  constructor(x) {
    super(x);
    this.model = this.ctx.model.Sample;
  }
  /**
  * @name start
  * @description 样本收集
  * @return {SuccessCallback} 数据库执行结果
  */
  async start() {
    // 获取所有股票代码
    const stocks = await this.ctx.service.selectStock.index({ select: 'code' });
    // const stocks = await this.ctx.service.stock.index({ filter: { $where: 'this.dayline.length > 0' }, select: 'code' });
    // 循环执行每个股票的样本收集
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.SampleInitOfOneStock(stock);
      console.log(`完成获取${stock.code}样本收集，总完成${i + 1}个，共${stocks.length}个`);
    }
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name SampleInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async SampleInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline tech sign ' });
    const sample = sampleFormat({ ...stock, tech: stock.tech.reverse(), dayline: stock.dayline.reverse() });
    return await this.insertMany(sample);
  }
}
module.exports = SampleService;
