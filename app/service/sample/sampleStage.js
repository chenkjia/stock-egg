'use strict';
const CustomService = require('../common');
const moment = require('moment');


const sampleFormat = ({ code, sign, stage }) => {
  console.log(sign.length);
  const resultSign = sign.filter((item, index) => {
    if (index === 0) {
      return true;
    }
    return item.date > moment(sign[index - 1].date).add(1, 'M');
  });
  console.log(resultSign.length);
  // console.log(sign);
  // console.log(stage);
  return resultSign.map(({ date }) => {
    let isSuccess = false;
    const largeStage = stage.find(({ start_date, end_date }) => {
      return start_date <= date && end_date >= date;
    });
    if (largeStage.end_date === stage[stage.length - 1].end_date) {
      return null;
    }
    if (largeStage.type === 'rise') {
      const middleStage = largeStage.children.find(({ start_date, end_date }) => {
        return start_date <= date && end_date >= date;
      });
      if (middleStage.type === 'rise') {
        isSuccess = true;
      }
    }
    return {
      code,
      sign_date: date,
      isSuccess,
    };
  }).filter(item => item);
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
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code sign stage' });
    const sample = sampleFormat(stock);
    return await this.insertMany(sample);
  }
}
module.exports = SampleService;
