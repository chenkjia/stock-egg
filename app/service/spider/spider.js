'use strict';
const Service = require('egg').Service;
class SpiderService extends Service {
  /**
  * @name start
  * @description 数据初始化
  * @return {SuccessCallback} 初始化执行结果
  */
  async start() {
    // const tradeDateCallback = await this.ctx.service.spider.tradeDate.tradeDateInit();
    // const bondCallback = await this.ctx.service.spider.bond.bondInit();
    const stockCallback = await this.stockInit();
    const daylineCallback = await this.daylineInit();
    // const adjCallback = await this.daylineAdj();
    return {
      // tradeDateCallback,
      // bondCallback,
      stockCallback,
      daylineCallback,
      // adjCallback,
    };
  }

  /**
  * @name stockInit
  * @description 初始化股票数据
  * @return {SuccessCallback} 股票初始化执行结果
  */
  async stockInit() {
    return await this.ctx.service.spider.stock.stockInit();
  }

  // /**
  // * @name adjInit
  // * @description 初始化股票复权因子
  // * @return {SuccessCallback} 复权因子初始化执行结果
  // */
  // async adjInit() {
  //   const adj = this.ctx.service.spider.adj;
  //   const initCallback = adj.adjInit();
  //   const updateCallback = adj.adjUpdate();
  //   return {
  //     initCallback,
  //     updateCallback,
  //   };
  // }

  /**
  * @name daylineInit
  * @description 初始化日线数据
  * @return {SuccessCallback} 日线数据初始化执行结果
  */
  async daylineInit() {
    return this.ctx.service.spider.dayline.daylineInit();
  }

  // /**
  // * @name daylineAdj
  // * @description 给日线数据复权
  // * @return {SuccessCallback} 给日线数据复权结果
  // */
  // async daylineAdj() {
  //   return await this.ctx.service.spider.dayline.daylineAdj();
  // }

  // /**
  // * @name timerStart
  // * @description 开启定时器
  // * @return {SuccessCallback} 定时器的启动情况
  // */
  // async timerStart() {
  //   return await this.ctx.service.spider.timer.timerStart();
  // }

  // /**
  // * @name 获取可转债列表
  // * @description 获取可转债列表
  // * @return {SuccessCallback} 获取可转债列表
  // */
  // async getBondsIssue() {
  //   return await this.ctx.service.spider.bond.getBondsIssue();
  // }

  // // 抓取最新数据，每天定时拉最新一天数据
  // async last() {
  //   const stockSpider = await this.stock();
  //   return {
  //     stockSpider,
  //   };
  // }
  // 通过股票代码和日期获取日线数据
  // async dayline({ code, date }) {
  //   return { code, date };
  // return await this.ctx.service.spider[this.source].daylineInit();
  // }
}
module.exports = SpiderService;
