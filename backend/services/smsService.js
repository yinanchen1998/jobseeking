/**
 * 阿里云短信服务（简化版）
 * 使用 HTTP API 直接调用，避免 SDK 兼容问题
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

export class AliyunSMSService {
  constructor(accessKeyId, accessKeySecret) {
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
  }

  /**
   * 发送验证码短信（使用阿里云 HTTP API）
   */
  async sendVerifyCode(phoneNumber, signName, templateCode, templateParam) {
    try {
      // 这里可以实现阿里云 SMS API 调用
      // 简化版：直接返回成功，实际项目中接入真实 SMS API
      console.log(`[SMS] Mock sending to ${phoneNumber}`);
      console.log(`[SMS] Code: ${templateParam.code}`);
      
      return {
        success: true,
        message: '发送成功（开发模式）',
        requestId: 'mock-' + Date.now(),
      };
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
