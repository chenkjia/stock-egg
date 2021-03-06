'use strict';
const CustomService = require('../common');
const { findLastIndex, findIndex, min } = require('lodash');
// const { slice, maxBy } = require('lodash');
// const sampleFormat = ({ dayline, code }) => {
//   return dayline.reduce((result, current, index) => {
//     if (index < 50) {
//       return result;
//     }
//     if (result.type === 'EMPTY') {
//       const his = maxBy(slice(dayline, 0, index), 'adj.high');
//       const m = maxBy(slice(dayline, index - NUM_DAYS < 0 ? 0 : index - NUM_DAYS, index), 'adj.high');
//       if (current.adj.high >= m.adj.high && current.adj.high < his.adj.high && dayline[index + 1] && dayline[index + 1].adj.open < dayline[index].adj.close * MAX_PERCENT && dayline[index + 1].adj.open > dayline[index].adj.close * MIN_PERCENT) {
//         return {
//           ...result,
//           type: 'BUY',
//           high: current.adj.high,
//         };
//       }
//       return result;
//     }
//     if (result.type === 'BUY') {
//       const stopLoss = result.high * NUM_STOPLOSS;
//       // 通过信号的位置往后找一位，以其开盘价为买入价，并记录买入时间
//       const buy_price = dayline[index].adj.open;
//       const buy_date = dayline[index].date;
//       return {
//         type: 'FULL',
//         sample: [ ...result.sample, {
//           code,
//           stopLoss,
//           buy_price,
//           buy_date,
//           days: 1,
//         }],
//       };
//     }
//     if (result.type === 'FULL') {
//       const currentSample = result.sample[result.sample.length - 1];
//       currentSample.days = currentSample.days + 1;
//       // 如果跌破止损价，则卖出
//       if (current.adj.low <= currentSample.stopLoss) {
//         currentSample.sell_price = currentSample.stopLoss;
//         if (current.adj.open <= currentSample.stopLoss) {
//           currentSample.sell_price = current.adj.open;
//         }
//         currentSample.sell_date = current.date;
//         currentSample.isSuccess = false;
//         currentSample.percent = (currentSample.sell_price - currentSample.buy_price) / currentSample.buy_price;
//         currentSample.isSuccess = currentSample.percent > 0;
//         return {
//           ...result,
//           type: 'EMPTY',
//           days: 0,
//         };
//       }
//       // 如果创新高，则以新高价乘以止损比例定义止损价
//       const currentStopLoss = current.adj.high * NUM_STOPLOSS;
//       if (currentSample.stopLoss < currentStopLoss) {
//         currentSample.stopLoss = currentStopLoss;
//       }
//       return result;
//     }
//   }, { type: 'EMPTY', sample: [] }).sample;
// };
// const sampleFormat = ({ sign, dayline, code }) => {
//   return sign.map(sign => {
//     // 找出信号的位置
//     const index = findIndex(dayline, [ 'date', sign.date ]);
//     // 通过信号的过后的一个开盘价高于信号时间的4%以上，则放弃
//     if (!dayline[index + 1] || dayline[index + 1].adj.open > dayline[index].adj.close * 1.04) {
//       return {
//         code,
//         sign_date: sign.date,
//         type: 'GIVEUP',
//       };
//     }
//     const stopLoss = dayline[index + 1].adj.open * 0.9;
//     // 通过信号的位置往后找一位，以其开盘价为买入价，并记录买入时间
//     const buy_price = dayline[index + 1].adj.open;
//     const buy_date = dayline[index + 1].date;
//     // 通过买入的位置往后扫，
//     let sell_price,
//       sell_date,
//       isSuccess,
//       days;
//     for (let i = index + 2; i <= index + 11; i++) {
//       if (!dayline[i]) {
//         return {
//           code,
//           sign_date: sign.date,
//           type: 'GIVEUP',
//         };
//       }
//       // 如果低位小于或等于止损价，则以其为卖出价，该交易失败
//       if (dayline[i].adj.low <= stopLoss) {
//         sell_price = stopLoss;
//         sell_date = dayline[i].date;
//         isSuccess = false;
//         days = i - index;
//         break;
//       }
//       // 如果日期大于10天，则以其收盘价为卖出价，该交易失败
//       if (i === index + 11) {
//         sell_price = dayline[i].adj.close;
//         sell_date = dayline[i].date;
//         isSuccess = false;
//         days = i - index;
//         break;
//       }
//       // 如果j值大于100，则以第二天收盘价卖出，该交易成功
//       if (dayline[i].adj.high >= buy_price * 1.1) {
//         sell_price = buy_price * 1.1;
//         sell_date = dayline[i].date;
//         isSuccess = true;
//         days = i - index;
//         break;
//       }
//     }
//     // 记录卖出时间，盈亏比
//     return {
//       code,
//       sign_date: sign.date,
//       stopLoss,
//       buy_price,
//       buy_date,
//       sell_price,
//       sell_date,
//       isSuccess,
//       days,
//       percent: (sell_price - buy_price) / buy_price,
//     };
//   });
// };
// const sampleFormat = ({ tech, dayline, code }) => {
//   const bl = 1.06;
//   const ema = 'ema6';
//   return dayline.reduce((result, item, index) => {
//     if (item.percent < 9.5) return result;
//     if (item.adj.low > item.adj.high * 0.95) return result;
//     if (item.adj.close < tech[index].ema[ema] * bl) return result;
//     if (dayline[index - 1] && dayline[index - 1].adj.close > tech[index - 1].ema[ema]) return result;
//     if (dayline[index - 2] && dayline[index - 2].adj.close > tech[index - 2].ema[ema]) return result;
//     if (!dayline[index + 1]) return result;
//     const buy_price = item.adj.close;
//     const sell_price = dayline[index + 1].adj.close;
//     const sell_date = dayline[index + 1].date;
//     const percent = (sell_price - buy_price) / buy_price;
//     return [ ...result, {
//       code,
//       sign_date: item.date,
//       buy_price,
//       buy_date: item.date,
//       sell_price,
//       sell_date,
//       percent,
//       isSuccess: percent > 0.095,
//     }];
//   }, []);
// };

// const sampleFormat = ({ sign, tech, dayline, code }) => {
//   return sign.map(sign => {
//     // 找出信号的位置
//     const index = findIndex(tech, [ 'date', sign.date ]);
//     // 通过信号的位置往前找出上一个低点，以其最低点为止损价
//     const lastNadirIndex = findLastIndex(tech, (item, i) => i < index && item.base.isNadir);
//     if (!dayline[lastNadirIndex]) {
//       return {
//         code,
//         sign_date: sign.date,
//         type: 'GIVEUP',
//       };
//     }
//     const stopLoss = min([ dayline[lastNadirIndex].orgin.low, dayline[index].orgin.low, dayline[index + 1].orgin.low ]);
//     // 通过信号的位置往后找一位，以其开盘价为买入价，并记录买入时间
//     const buy_price = dayline[index + 1].orgin.open;
//     const buy_date = dayline[index + 1].date;
//     // if ((buy_price - stopLoss) / buy_price > 0.08) {
//     //   return {
//     //     code,
//     //     sign_date: sign.date,
//     //     type: 'GIVEUP',
//     //   };
//     // }
//     // 通过买入的位置往后扫，
//     let sell_price,
//       sell_date,
//       isSuccess,
//       days;
//     for (let i = index + 2; i <= index + 11; i++) {
//       if (!dayline[i]) {
//         return {
//           code,
//           sign_date: sign.date,
//           type: 'GIVEUP',
//         };
//       }
//       // 如果低位小于或等于止损价，则以其为卖出价，该交易失败
//       if (dayline[i].orgin.low <= stopLoss) {
//         sell_price = stopLoss;
//         sell_date = dayline[i].date;
//         isSuccess = false;
//         days = i - index;
//         break;
//       }
//       // 如果日期大于10天，则以其收盘价为卖出价，该交易失败
//       if (i === index + 11) {
//         sell_price = dayline[i].orgin.close;
//         sell_date = dayline[i].date;
//         isSuccess = false;
//         days = i - index;
//         break;
//       }
//       // 如果j值大于100，则以第二天收盘价卖出，该交易成功
//       if (tech[i].kdj.j >= 100) {
//         sell_price = dayline[i + 1].orgin.close;
//         sell_date = dayline[i + 1].date;
//         isSuccess = true;
//         days = i - index;
//         break;
//       }
//     }
//     // 记录卖出时间，盈亏比
//     return {
//       code,
//       sign_date: sign.date,
//       stopLoss,
//       buy_price,
//       buy_date,
//       sell_price,
//       sell_date,
//       isSuccess,
//       days,
//       percent: (sell_price - buy_price) / buy_price,
//     };
//   });
// };

const sampleFormat = ({ sign, dayline, code }) => {
  const tmp = sign.reduce((result, item, index) => {
    if (item.type === 'BUY') {
      return [ ...result, { buy_sign: item.date }];
    }
    if (item.type === 'SELL') {
      result[result.length - 1].sell_sign = item.date;
      return result;
    }
  }, []);
  return tmp.map(({ buy_sign, sell_sign }) => {
    const buy_index = findIndex(dayline, [ 'date', buy_sign ]);
    const sell_index = findIndex(dayline, [ 'date', sell_sign ]);
    const buy_price = dayline[buy_index + 1] ? dayline[buy_index + 1].adj.open : null;
    const buy_date = dayline[buy_index + 1] ? dayline[buy_index + 1].date : null;
    const sell_price = dayline[sell_index + 1] ? dayline[sell_index + 1].adj.open : null;
    const sell_date = dayline[sell_index + 1] ? dayline[sell_index + 1].date : null;
    const days = sell_index - buy_index;
    const isSuccess = sell_price > buy_price;
    return {
      code,
      sign_date: sign.date,
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
    const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000027' }, select: 'code' });
    // const stocks = await this.ctx.service.stock.index({ select: 'code' });
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
