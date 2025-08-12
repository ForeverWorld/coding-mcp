import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ComprehensiveConfigManager } from './comprehensive-config.js';
import { 
  CodingApiRequest, 
  CodingApiResponse, 
  ComprehensiveCodingApiError,
  CacheManager,
  CacheEntry,
  ApiMetrics,
  ModuleMetrics
} from '../types/comprehensive-types.js';

/**
 * 简单的内存缓存实现
 */
class MemoryCacheManager implements CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * 并发控制器
 */
class ConcurrencyController {
  private activeRequests = 0;
  private queue: Array<() => void> = [];

  constructor(private maxConcurrent: number) {}

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeRequests < this.maxConcurrent) {
        this.activeRequests++;
        resolve();
      } else {
        this.queue.push(() => {
          this.activeRequests++;
          resolve();
        });
      }
    });
  }

  release(): void {
    this.activeRequests--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

/**
 * 增强的 CODING API 客户端
 * 支持缓存、并发控制、监控、重试等高级功能
 */
export class ComprehensiveApiClient {
  private httpClient: AxiosInstance;
  private configManager: ComprehensiveConfigManager;
  private cacheManager: CacheManager;
  private concurrencyController: ConcurrencyController;
  private metrics: ModuleMetrics = {};
  private startTime = Date.now();

  constructor(configManager: ComprehensiveConfigManager) {
    this.configManager = configManager;
    this.cacheManager = new MemoryCacheManager();
    
    const concurrencyConfig = this.configManager.getConcurrencyConfig();
    this.concurrencyController = new ConcurrencyController(concurrencyConfig.maxConcurrentRequests);
    
    this.initializeHttpClient();
    this.initializeMetrics();
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
        const module = this.extractModuleFromRequest(config);
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} [${module}]`);
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
        const module = this.extractModuleFromResponse(response);
        console.log(`[API Response] ${response.status} ${response.config.url} [${module}]`);
        return response;
      },
      (error) => {
        const module = this.extractModuleFromError(error);
        console.error(`[API Response Error] [${module}]`, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 初始化监控指标
   */
  private initializeMetrics(): void {
    const modules = this.configManager.getAllModuleConfigs();
    modules.forEach(module => {
      this.metrics[module.name] = {
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        lastRequestTime: 0,
      };
    });
  }

  /**
   * 从请求中提取模块名
   */
  private extractModuleFromRequest(config: any): string {
    const data = config.data;
    if (data && data.Action) {
      return this.getModuleFromAction(data.Action);
    }
    return 'unknown';
  }

  /**
   * 从响应中提取模块名
   */
  private extractModuleFromResponse(response: AxiosResponse): string {
    const data = response.config.data;
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.Action) {
        return this.getModuleFromAction(parsed.Action);
      }
    }
    return 'unknown';
  }

  /**
   * 从错误中提取模块名
   */
  private extractModuleFromError(error: any): string {
    if (error.config && error.config.data) {
      const data = error.config.data;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.Action) {
        return this.getModuleFromAction(parsed.Action);
      }
    }
    return 'unknown';
  }

  /**
   * 根据 Action 确定模块名
   */
  private getModuleFromAction(action: string): string {
    if (action.includes('Cd') || action.includes('Deploy')) return 'cd-devops';
    if (action.includes('Git') || action.includes('Depot') || action.includes('Branch')) return 'git-management';
    if (action.includes('Issue')) return 'issue-management';
    if (action.includes('CodingCI') || action.includes('Build')) return 'ci-build';
    if (action.includes('Artifact')) return 'artifact-registry';
    if (action.includes('Wiki')) return 'wiki-docs';
    if (action.includes('User') || action.includes('Team') || action.includes('Project')) return 'user-team';
    if (action.includes('ServiceHook') || action.includes('Hook')) return 'service-hooks';
    if (action.includes('MergeRequest') || action.includes('MR')) return 'merge-requests';
    return 'unknown';
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(action: string, params: any): string {
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    return `${action}:${Buffer.from(paramsString).toString('base64')}`;
  }

  /**
   * 更新监控指标
   */
  private updateMetrics(module: string, startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;
    const metrics = this.metrics[module];
    
    if (metrics) {
      metrics.requestCount++;
      metrics.lastRequestTime = Date.now();
      
      if (success) {
        metrics.successCount++;
      } else {
        metrics.errorCount++;
      }
      
      // 计算平均响应时间
      const totalRequests = metrics.requestCount;
      metrics.averageResponseTime = 
        (metrics.averageResponseTime * (totalRequests - 1) + duration) / totalRequests;
    }
  }

  /**
   * 执行 API 请求
   */
  async request<T = any>(
    action: string,
    params: Omit<CodingApiRequest, 'Action'> = {},
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      module?: string;
    } = {}
  ): Promise<T> {
    const module = options.module || this.getModuleFromAction(action);
    const startTime = Date.now();
    
    try {
      // 并发控制
      await this.concurrencyController.acquire();
      
      const requestData: CodingApiRequest = {
        Action: action,
        ...params,
      };

      // 缓存检查
      const cacheConfig = this.configManager.getCacheConfig();
      const useCache = options.useCache ?? cacheConfig.enabled;
      
      if (useCache && this.isReadOnlyAction(action)) {
        const cacheKey = this.generateCacheKey(action, params);
        const cachedResult = await this.cacheManager.get<T>(cacheKey);
        
        if (cachedResult) {
          console.log(`[Cache Hit] ${action}`);
          this.updateMetrics(module, startTime, true);
          return cachedResult;
        }
      }

      // 执行请求
      const response = await this.retryRequest(() =>
        this.httpClient.post<CodingApiResponse<T>>('', requestData)
      );

      const result = response.data;
      
      // 检查 API 错误
      if (result.Response.Error) {
        throw new ComprehensiveCodingApiError(
          result.Response.Error.Code,
          result.Response.Error.Message,
          result.Response.RequestId,
          { action, params }
        );
      }

      const responseData = result.Response as T;

      // 缓存结果
      if (useCache && this.isReadOnlyAction(action)) {
        const cacheKey = this.generateCacheKey(action, params);
        const cacheTTL = options.cacheTTL ?? cacheConfig.ttl;
        await this.cacheManager.set(cacheKey, responseData, cacheTTL);
      }

      this.updateMetrics(module, startTime, true);
      return responseData;

    } catch (error) {
      this.updateMetrics(module, startTime, false);
      
      if (error instanceof ComprehensiveCodingApiError) {
        throw error;
      }
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.Response?.Error?.Message || error.message;
        const code = error.response?.data?.Response?.Error?.Code || 'NETWORK_ERROR';
        const requestId = error.response?.data?.Response?.RequestId;
        
        throw new ComprehensiveCodingApiError(code, message, requestId, { action, params });
      }
      
      throw new ComprehensiveCodingApiError(
        'UNKNOWN_ERROR', 
        error.message || '未知错误',
        undefined,
        { action, params }
      );
    } finally {
      this.concurrencyController.release();
    }
  }

  /**
   * 判断是否为只读操作
   */
  private isReadOnlyAction(action: string): boolean {
    return action.startsWith('Describe') || 
           action.startsWith('Get') || 
           action.startsWith('List') ||
           action.startsWith('Check');
  }

  /**
   * 带重试的请求执行
   */
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt = 1
  ): Promise<AxiosResponse<T>> {
    const config = this.configManager.getConcurrencyConfig();
    
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < config.retryAttempts && this.shouldRetry(error)) {
        console.log(`[Retry] Attempt ${attempt + 1}/${config.retryAttempts}`);
        await this.delay(1000 * Math.pow(2, attempt - 1)); // 指数退避
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
      const code = error.response?.data?.Response?.Error?.Code;
      
      // 对于网络错误、超时、5xx 错误或特定的业务错误进行重试
      return !status || 
             status >= 500 || 
             error.code === 'ECONNRESET' || 
             error.code === 'ETIMEDOUT' ||
             code === 'RequestLimitExceeded' ||
             code === 'InternalError';
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
  updateConfig(configManager: ComprehensiveConfigManager): void {
    this.configManager = configManager;
    this.initializeHttpClient();
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('DescribeCodingCurrentUser', {}, { 
        useCache: false,
        module: 'user-team'
      });
      return true;
    } catch (error) {
      console.error('[Health Check Failed]', error);
      return false;
    }
  }

  /**
   * 获取监控指标
   */
  getMetrics(): ModuleMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取特定模块的指标
   */
  getModuleMetrics(module: string): ApiMetrics | null {
    return this.metrics[module] || null;
  }

  /**
   * 重置监控指标
   */
  resetMetrics(): void {
    Object.keys(this.metrics).forEach(module => {
      this.metrics[module] = {
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        lastRequestTime: 0,
      };
    });
  }

  /**
   * 获取运行时间
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * 清空缓存
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * 批量请求
   */
  async batchRequest<T = any>(
    requests: Array<{
      action: string;
      params?: Omit<CodingApiRequest, 'Action'>;
      options?: { useCache?: boolean; cacheTTL?: number; module?: string };
    }>
  ): Promise<Array<{ success: boolean; data?: T; error?: ComprehensiveCodingApiError }>> {
    const promises = requests.map(async (req) => {
      try {
        const data = await this.request<T>(req.action, req.params, req.options);
        return { success: true, data };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof ComprehensiveCodingApiError ? error : 
                 new ComprehensiveCodingApiError('BATCH_ERROR', error.message)
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * 获取健康状态
   */
  getHealthStatus(): {
    healthy: boolean;
    uptime: number;
    modules: Record<string, boolean>;
    metrics: ModuleMetrics;
  } {
    const modules = this.configManager.getAllModuleConfigs();
    const moduleHealth: Record<string, boolean> = {};
    
    modules.forEach(module => {
      const metrics = this.metrics[module.name];
      // 模块健康判断：有请求且成功率 > 80%
      moduleHealth[module.name] = !metrics || 
        metrics.requestCount === 0 || 
        (metrics.successCount / metrics.requestCount) > 0.8;
    });

    const overallHealthy = Object.values(moduleHealth).every(healthy => healthy);

    return {
      healthy: overallHealthy,
      uptime: this.getUptime(),
      modules: moduleHealth,
      metrics: this.getMetrics(),
    };
  }
}
