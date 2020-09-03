'use strict';
const Service = require('egg').Service;

class TechService extends Service {
  /**
  * @name start
  * @description 技术指标初始化
  * @return {SuccessCallback} 初始化执行结果
  */
  async start() {
    const techDataCallback = await this.data();
    const techMarkCallback = await this.mark();
    const techSignCallback = await this.sign();
    return {
      techDataCallback,
      techMarkCallback,
      techSignCallback,
    };
  }
  async data() {
    return await this.ctx.service.tech.techData.init();
  }
  async mark() {
    return await this.ctx.service.tech.techMark.init();
  }
  async sign() {
    return await this.ctx.service.tech.techSign.init();
  }
}
module.exports = TechService;
