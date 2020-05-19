'use strict';

const Controller = require('egg').Controller;

class SelectStockController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.selectStock;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.start();
  }
}

module.exports = SelectStockController;
