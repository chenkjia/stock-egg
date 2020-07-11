'use strict';
const Service = require('egg').Service;
const { slice } = require('lodash');
const {
  stageFormat,
  isStageSign,
  isStageBackSign,
} = require('./common');


class StageService extends Service {
  /**
  * @name start
  * @description 技术指标初始化
  * @return {SuccessCallback} 数据库执行结果
  */
  async start() {
    // 获取所有股票代码
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000158' }, select: 'code' });
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行每个股票的技术指标初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.StageInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标标识初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name StageInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async StageInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const dayline = stock.dayline.reverse();
    const stages = stageFormat(dayline);
    // for (let i = 0; i < dayline.length; i++) {
    //   const day = dayline[i];
    //   const stages = stageFormat(slice(dayline, 0, i));
    //   const lastStage = stages[stages.length - 1];
    //   if (lastStage && lastStage.type === 'rise' && lastStage.children.length === 3) {
    //     const lastFailStage = stages[stages.length - 2];
    //     if (lastFailStage && lastFailStage.children[lastFailStage.children.length - 2] && lastFailStage.children[lastFailStage.children.length - 2].start_price < lastStage.children[0].end_price) {
    //       console.log(day.date);
    //     }
    //   }
    //   console.log(`完成第${i}天测试`);
    // }
    // return stages;
    return await this.ctx.service.stock.checkAndUpdateStage(stock, stages);
  }
  /**
  * @name sign
  * @description 技术指标初始化
  * @return {SuccessCallback} 数据库执行结果
  */
  async sign() {
    // 获取所有股票代码
    const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000551' }, select: 'code' });
    // const stocks = await this.ctx.service.selectStock.index({ select: 'code' });
    // const stocks = await this.ctx.service.stock.index({ select: 'code', query: { limit: 100 } });
    // 循环执行每个股票的技术指标初始化
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.StageSignInitOfOneStock(stock);
      console.log(`完成获取${stock.code}技术指标标识初始化，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成技术指标初始化');
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name StageSignInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async StageSignInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code dayline' });
    const dayline = stock.dayline.reverse();
    const sign = dayline.reduce((result, item, i) => {
      const stages = stageFormat(slice(dayline, 0, i + 1));
      if (isStageBackSign(stages)) {
        return [ ...result, item ];
      }
      console.log(`${stock.code}第${i}天测试,总共${dayline.length}天`);
      return result;
    }, []);
    // const index = findIndex(dayline, [ 'date', new Date(2020, 4, 19) ]);
    // const stages = stageFormat(slice(dayline, 0, index + 1));
    // console.log(isStageSign(stages));
    // console.log(dayline[index]);
    // return stages;
    return await this.ctx.service.stock.checkAndUpdateSign(stock, sign);
  }
}
module.exports = StageService;
