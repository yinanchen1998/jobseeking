/**
 * 阿里云短信服务
 * 基于号码认证服务(Dypnsapi)发送验证码
 */

import Dypnsapi20170525 from '@alicloud/dypnsapi20170525';
import OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';

export class AliyunSMSService {
  /**
   * @param {string} accessKeyId - 阿里云AccessKey ID
   * @param {string} accessKeySecret - 阿里云AccessKey Secret
   */
  constructor(accessKeyId, accessKeySecret) {
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
    this.endpoint = 'dypnsapi.aliyuncs.com';
    
    // 创建客户端配置
    const config = new OpenApi.Config({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
    });
    config.endpoint = this.endpoint;
    this.client = new Dypnsapi20170525(config);
  }

  /**
   * 发送验证码短信
   * @param {string} phoneNumber - 手机号
   * @param {string} signName - 短信签名
   * @param {string} templateCode - 短信模板CODE
   * @param {object} templateParam - 模板参数 { code: '123456', min: '5' }
   * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
   */
  async sendVerifyCode(phoneNumber, signName, templateCode, templateParam) {
    try {
      const request = new Dypnsapi20170525.SendSmsVerifyCodeRequest({
        signName,
        templateCode,
        phoneNumber,
        templateParam: JSON.stringify(templateParam),
      });

      const runtime = new Util.RuntimeOptions({});
      
      console.log(`[SMS] Sending to ${phoneNumber}, sign=${signName}, template=${templateCode}`);
      
      const response = await this.client.sendSmsVerifyCodeWithOptions(request, runtime);
      const body = response.body;
      
      console.log(`[SMS] Response:`, body);

      if (body.code === 'OK') {
        return {
          success: true,
          message: '发送成功',
          requestId: body.requestId,
          bizId: body.bizId,
        };
      } else {
        console.error(`[SMS] Error: [${body.code}] ${body.message}`);
        return {
          success: false,
          message: body.message || '发送失败',
          code: body.code,
        };
      }
    } catch (error) {
      console.error('[SMS] Exception:', error);
      return {
        success: false,
        message: error.message || '发送失败',
      };
    }
  }
}

export default AliyunSMSService;
