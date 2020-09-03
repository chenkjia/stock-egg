'use strict';

const Controller = require('egg').Controller;

class TechController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.tech;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.tech.start();
  }
  async data() {
    const { ctx, service } = this;
    ctx.body = await service.tech.data();
  }
  async mark() {
    const { ctx, service } = this;
    ctx.body = await service.tech.mark();
  }
  async sign() {
    const { ctx, service } = this;
    ctx.body = await service.tech.sign();
  }
}

module.exports = TechController;
