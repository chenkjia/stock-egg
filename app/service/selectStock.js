'use strict';
const CustomService = require('./common');

class SelectStockService extends CustomService {
  constructor(x) {
    super(x);
    this.model = this.ctx.model.SelectStock;
  }
  /**
  * @name start
  * @description 样本收集
  * @return {SuccessCallback} 数据库执行结果
  */
  async start() {
    // 获取所有股票代码
    // const stocks = await this.ctx.service.stock.index({ filter: { symbol: '000001' }, select: 'code' });
    const stocks = await this.ctx.service.stock.index({ select: 'code' });
    // 循环执行判断每个股票的是否是上升趋势股票
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      const isSelectStock = await this.SelectStockInitOfOneStock(stock);
      if (isSelectStock) {
        await this.create({ code: stock.code });
      }
      console.log(`完成判断${stock.code}是否上升趋势，总完成${i + 1}个，共${stocks.length}个`);
    }
    return {
      code: 0,
      message: 'success',
    };
  }
  /**
  * @name SelectStockInitOfOneStock
  * @description 单个股票技术指标初始化
  * @param {Object} stock 股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async SelectStockInitOfOneStock({ code }) {
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code stage' });
    const stages = stock.stage;
    // 如果趋势小于2，则返回错误
    if (stages.length < 2) {
      return false;
    }
    // 定义当前大趋势与上一个大趋势,与当前中趋势
    const currentStage = stages[stages.length - 1];
    // 当前趋势的子趋势为3个
    if (currentStage.children.length !== 3) {
      return false;
    }
    // 定义当前中趋势
    const currentMiddleStage = currentStage.children[currentStage.children.length - 1];
    // 当前趋势与当前子趋势都为rise
    if (!(currentStage.type === 'rise' && currentMiddleStage.type === 'rise')) {
      return false;
    }
    // 定义当上上个中趋势
    const lastMiddleStage = currentStage.children[currentStage.children.length - 3];
    // 当前趋势的结束价格大于上上个子趋势的结束价格
    if (currentMiddleStage.end_price < lastMiddleStage.end_price) {
      return false;
    }
    // 当前趋势的开始价格大于上上个子趋势的开始价格
    if (currentMiddleStage.start_price < lastMiddleStage.start_price) {
      return false;
    }
    // 上上个子趋势的结束价格大于上个大级别最后一个子趋势的开始价格
    const lastStage = stages[stages.length - 2];
    const lastLargeStageLastStage = lastStage.children[lastStage.children.length - 1];
    if (lastMiddleStage.end_price < lastLargeStageLastStage.start_price) {
      return false;
    }
    return true;
  }
}
module.exports = SelectStockService;
