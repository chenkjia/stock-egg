'use strict';
const Service = require('egg').Service;

class TechService extends Service {
  /**
  * @name start
  * @description 技术指标初始化
  * @return {SuccessCallback} 初始化执行结果
  */
  async start() {
    const techDataCallback = await this.ctx.service.tech.techData.init();
    const techMarkCallback = await this.ctx.service.tech.techMark.init();
    const techSignCallback = await this.ctx.service.tech.techSign.init();
    return {
      techDataCallback,
      techMarkCallback,
      techSignCallback,
    };
  }
}
module.exports = TechService;
