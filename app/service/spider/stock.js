'use strict';

const Service = require('egg').Service;
const zipObject = require('lodash/zipObject');


class StockService extends Service {
  /**
  * @name stockInit
  * @description 初始化股票数据
  * @return {SuccessCallback} 股票初始化执行结果
  */
  async stockInit() {
    const stocks = await this.getStocks();
    return await this.updateStocks(stocks);
  }
  /**
  * @name getStocks
  * @description 抓取所有股票数据
  * @return {Array} stocks
  */
  async getStocks() {
    const ctx = this.ctx;
    const result = await ctx.curl('http://api.waditu.com', {
      method: 'POST',
      contentType: 'json',
      data: {
        api_name: 'stock_basic',
        token: '021aced2154517da19b6d76dca1f9fc02b8fdaa5aa1a8e43fee373fd',
      },
      dataType: 'json',
    });
    console.log(result.data);
    const data = result.data.data;
    return data.items.map(item => {
      const stock = zipObject(data.fields, item);
      return {
        ...stock,
        code: stock.ts_code,
      };
    });
  }
  /**
  * @name updateStocks
  * @description 将股票数据存到数据库
  * @param {Array} stocks 输入要更新数据库的股票
  * @return {SuccessCallback} 数据库执行结果
  */
  async updateStocks(stocks) {
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      await this.ctx.service.stock.checkAndUpdate(stock);
      console.log(`完成获取${stock.code}股票数据，总完成${i + 1}个，共${stocks.length}个`);
    }
    console.log('完成股票列表数据更新');
    return {
      code: 0,
      message: 'success',
    };
  }
}

module.exports = StockService;

