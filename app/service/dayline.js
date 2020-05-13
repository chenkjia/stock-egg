'use strict';

const CustomService = require('./common');

class StockService extends CustomService {
  constructor(x) {
    super(x);
    this.model = this.ctx.model.Stock;
  }
  async index({ filter = {}, select = '-adj -dayline', query = {} }) {
    return await this.model.find(filter, select, query);
  }
  // async checkAndCreate(stock) {
  //   // 通过唯一码查找股票
  //   const stock = await this.show({ filter: { code: stock.code } });
  //   let result;
  //   if (stock && stock.code) {
  //     // 如果股票存在，就修改其信息
  //     result = await this.update({ _id: stock._id }, stock);
  //   } else {
  //     // 如果股票不存在，就添加这支股票
  //     result = await this.create(stock);
  //   }
  //   return result;
  // }
  async checkAndUpdateDayline(stock, dayline) {
    // 通过唯一码查找股票,并向dayline的头部插入数据
    return await this.model.updateOne({ code: stock.code }, {
      $push: {
        dayline: { $each: dayline, $position: 0 },
      },
    }, {
      upsert: true, // 查不到，则添加新数据
    });
  }
}

module.exports = StockService;
