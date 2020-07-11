'use strict';
const CustomService = require('./common');
const {
  isStageSign,
} = require('./stage/common');

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
    const stock = await this.ctx.service.stock.show({ filter: { code }, select: 'code stage tech dayline' });
    const { stage, tech, dayline } = stock;

    return isStageSign(stage, tech, dayline);
  }
}
module.exports = SelectStockService;
