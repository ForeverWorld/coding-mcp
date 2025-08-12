import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ConfigManager } from './config.js';
import { CodingApiRequest, CodingApiResponse, CodingApiError } from './types.js';

/**
 * CODING API 客户端
 * 负责与 CODING API 的通信
 */
export class CodingApiClient {
  private httpClient: AxiosInstance;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.initializeHttpClient();
  }

  /**
   * 初始化 HTTP 客户端
   */
  private initializeHttpClient(): void {
    const config = this.configManager.getConfig();
    
    this.httpClient = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.timeout,
      headers: this.configManager.getAuthHeaders(),
    });

    // 请求拦截器
    this.httpClient.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.httpClient.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 执行 API 请求
   */
  async request<T = any>(
    action: string,
    params: Omit<CodingApiRequest, 'Action'> = {}
  ): Promise<T> {
    const config = this.configManager.getConfig();
    const requestData: CodingApiRequest = {
      Action: action,
      ...params,
    };

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post<CodingApiResponse<T>>('', requestData)
      );

      const result = response.data;
      
      // 检查 API 错误
      if (result.Response.Error) {
        throw new CodingApiError(
          result.Response.Error.Code,
          result.Response.Error.Message,
          result.Response.RequestId
        );
      }

      return result.Response as T;
    } catch (error) {
      if (error instanceof CodingApiError) {
        throw error;
      }
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.Response?.Error?.Message || error.message;
        const code = error.response?.data?.Response?.Error?.Code || 'NETWORK_ERROR';
        throw new CodingApiError(code, message);
      }
      
      throw new CodingApiError('UNKNOWN_ERROR', error.message || '未知错误');
    }
  }

  /**
   * 带重试的请求执行
   */
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt = 1
  ): Promise<AxiosResponse<T>> {
    const config = this.configManager.getConfig();
    
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < config.retryAttempts && this.shouldRetry(error)) {
        console.log(`[Retry] Attempt ${attempt + 1}/${config.retryAttempts}`);
        await this.delay(1000 * attempt); // 指数退避
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // 对于网络错误、超时或 5xx 错误进行重试
      return !status || status >= 500 || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
    }
    return false;
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(configManager: ConfigManager): void {
    this.configManager = configManager;
    this.initializeHttpClient();
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('DescribeCodingCurrentUser');
      return true;
    } catch (error) {
      console.error('[Health Check Failed]', error);
      return false;
    }
  }
}
