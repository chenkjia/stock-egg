'use strict';
const CustomService = require('../common');
const moment = require('moment');
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
  middle: 15,
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
      children: /* index >= points.length - 3 && */scale === 'large' ? stageFormat(slice(dayline, start_index, end_index + 1), 'middle') : [],
    };
  }).filter(item => item);
};

const sampleFormat = ({ code, sign, dayline }) => {
  const resultSign = sign.filter((item, index) => {
    if (index === 0) {
      return true;
    }
    return item.date > moment(sign[index - 1].date).add(1, 'M');
  });
  return resultSign.map(({ date }) => {
    // 列出当时的趋势判断
    const index = findIndex(dayline, [ 'date', date ]);
    const stages = stageFormat(slice(dayline, 0, index + 1));
    // 把上一个中趋势的结束价作为止损价，
    const currentBigStages = stages[stages.length - 1].children;
    const lastStage = currentBigStages[currentBigStages.length - 2];
    const lastSecendStage = currentBigStages[currentBigStages.length - 3];
    const stopLoss = lastStage.end_price;
    // 把上上个中趋势的结束价减去上上个中趋势的开始价加上上一个中趋势的结束价作为止盈价
    if (currentBigStages.length <= 1) {
      return {
        code,
        sign_date: sign.date,
        type: 'GIVEUP',
      };
    }
    console.log(date);
    console.log(currentBigStages);
    console.log(lastSecendStage);
    const stopSurplus = lastSecendStage.end_price - lastSecendStage.start_price + lastStage.end_price;
    // 记录买入时间和价格
    const buy_price = lastSecendStage.end_price;
    const buy_date = date;
    // 开始向后轮询
    let sell_price,
      sell_date,
      isSuccess,
      days;
    for (let i = index + 1; i <= dayline.length; i++) {
      if (!dayline[i]) {
        return {
          code,
          sign_date: sign.date,
          type: 'GIVEUP',
        };
      }
      // 如果低位大于或等于止损价，则以其为卖出价，该交易成功
      if (dayline[i].orgin.high >= stopSurplus) {
        sell_price = stopSurplus;
        sell_date = dayline[i].date;
        isSuccess = true;
        days = i - index;
        break;
      }
      // 如果低位小于或等于止损价，则以其为卖出价，该交易失败
      if (dayline[i].orgin.low <= stopLoss) {
        sell_price = stopLoss;
        sell_date = dayline[i].date;
        isSuccess = false;
        days = i - index;
        break;
      }
      // 如果日期大于20天，则以其收盘价为卖出价，该交易失败
      if (i === index + 7) {
        sell_price = dayline[i].orgin.close;
        sell_date = dayline[i].date;
        isSuccess = false;
        days = i - index;
        break;
      }
    }
    return {
      code,
      sign_date: sign.date,
      stopLoss,
      stopSurplus,
      buy_price,
      buy_date,
      sell_price,
      sell_date,
      isSuccess,
      days,
      percent: (sell_price - buy_price) / buy_price,
    };
  }).filter(item => item);
};
// const sampleFormat = ({ code, sign, stage }) => {
//   console.log(sign.length);
//   const resultSign = sign.filter((item, index) => {
//     if (index === 0) {
//       return true;
//     }
//     return item.date > moment(sign[index - 1].date).add(1, 'M');
//   });
//   console.log(resultSign.length);
//   // console.log(sign);
//   // console.log(stage);
//   return resultSign.map(({ date }) => {
//     let isSuccess = false;
//     const largeStage = stage.find(({ start_date, end_date }) => {
//       return start_date <= date && end_date >= date;
//     });
//     if (largeStage.end_date === stage[stage.length - 1].end_date) {
//       return null;
//     }
//     if (largeStage.type === 'rise') {
//       const middleStage = largeStage.children.find(({ start_date, end_date }) => {
//         return start_date <= date && end_date >= date;
//       });
//       if (middleStage.type === 'rise') {
//         isSuccess = true;
//       }
//     }
//     return {
//       code,
//       sign_date: date,
//       isSuccess,
//     };
//   }).filter(item => item);
// };

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
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code sign stage dayline' });
    const sample = sampleFormat({ code: stock.code, sign: stock.sign, dayline: stock.dayline.reverse() });
    return await this.insertMany(sample);
  }
}
module.exports = SampleService;
