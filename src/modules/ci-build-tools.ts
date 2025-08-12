import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { 
  CiJob, 
  CiBuild, 
  CiBuildStep, 
  CiBuildLog,
  PaginatedResponse
} from '../types/comprehensive-types.js';

/**
 * CI/Build 持续集成构建工具
 * 涵盖构建任务、构建记录、构建日志、构建步骤等功能
 */
export class CiBuildTools {
  constructor(private apiClient: ComprehensiveApiClient) {}

  /**
   * 获取所有 CI/Build 相关工具定义
   */
  getTools(): Tool[] {
    return [
      // 构建任务管理
      {
        name: 'coding_ci_list_jobs',
        description: '获取构建任务列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            keyword: { type: 'string', description: '搜索关键词' },
          },
        },
      },
      {
        name: 'coding_ci_get_job',
        description: '获取构建任务详情',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'coding_ci_create_job',
        description: '创建构建任务',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            name: { type: 'string', description: '任务名称' },
            displayName: { type: 'string', description: '显示名称' },
            description: { type: 'string', description: '任务描述' },
            triggerMethod: { 
              type: 'string', 
              enum: ['MANUAL', 'PUSH', 'MERGE_REQUEST', 'SCHEDULE'],
              description: '触发方式'
            },
            depotName: { type: 'string', description: '代码仓库名称' },
            branch: { type: 'string', description: '分支名称', default: 'master' },
            jenkinsFileFromType: { 
              type: 'string', 
              enum: ['STATIC', 'SCM'],
              description: 'Jenkinsfile 来源类型',
              default: 'SCM'
            },
            jenkinsFilePath: { type: 'string', description: 'Jenkinsfile 路径', default: 'Jenkinsfile' },
            config: { type: 'object', description: '构建配置' },
          },
          required: ['projectId', 'name', 'displayName', 'depotName'],
        },
      },
      {
        name: 'coding_ci_update_job',
        description: '更新构建任务',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
            displayName: { type: 'string', description: '显示名称' },
            description: { type: 'string', description: '任务描述' },
            triggerMethod: { 
              type: 'string', 
              enum: ['MANUAL', 'PUSH', 'MERGE_REQUEST', 'SCHEDULE'],
              description: '触发方式'
            },
            branch: { type: 'string', description: '分支名称' },
            config: { type: 'object', description: '构建配置' },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'coding_ci_delete_job',
        description: '删除构建任务',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
          },
          required: ['jobId'],
        },
      },

      // 构建记录管理
      {
        name: 'coding_ci_list_builds',
        description: '获取构建记录列表',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            status: { 
              type: 'string', 
              enum: ['RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT'],
              description: '构建状态'
            },
            branch: { type: 'string', description: '分支名称' },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'coding_ci_get_build',
        description: '获取构建记录详情',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },
      {
        name: 'coding_ci_trigger_build',
        description: '触发构建',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
            branch: { type: 'string', description: '分支名称', default: 'master' },
            commitSha: { type: 'string', description: '提交 SHA（可选）' },
            parameters: { type: 'object', description: '构建参数（可选）' },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'coding_ci_stop_build',
        description: '停止构建',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },
      {
        name: 'coding_ci_restart_build',
        description: '重新构建',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },

      // 构建步骤管理
      {
        name: 'coding_ci_list_build_steps',
        description: '获取构建步骤列表',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },
      {
        name: 'coding_ci_get_build_step',
        description: '获取构建步骤详情',
        inputSchema: {
          type: 'object',
          properties: {
            stepId: { type: 'number', description: '步骤 ID' },
          },
          required: ['stepId'],
        },
      },

      // 构建日志管理
      {
        name: 'coding_ci_get_build_log',
        description: '获取构建日志',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
            startLine: { type: 'number', description: '起始行号', default: 1 },
            endLine: { type: 'number', description: '结束行号' },
            format: { type: 'string', enum: ['text', 'json'], default: 'text', description: '日志格式' },
          },
          required: ['buildId'],
        },
      },
      {
        name: 'coding_ci_get_build_step_log',
        description: '获取构建步骤日志',
        inputSchema: {
          type: 'object',
          properties: {
            stepId: { type: 'number', description: '步骤 ID' },
            startLine: { type: 'number', description: '起始行号', default: 1 },
            endLine: { type: 'number', description: '结束行号' },
          },
          required: ['stepId'],
        },
      },
      {
        name: 'coding_ci_get_raw_build_log',
        description: '获取原始构建日志',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },

      // 构建统计和分析
      {
        name: 'coding_ci_get_build_statistics',
        description: '获取构建统计信息',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID（可选）' },
            projectId: { type: 'number', description: '项目 ID（可选）' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
          },
        },
      },
      {
        name: 'coding_ci_get_build_trends',
        description: '获取构建趋势分析',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID（可选）' },
            projectId: { type: 'number', description: '项目 ID（可选）' },
            period: { 
              type: 'string', 
              enum: ['7d', '30d', '90d'],
              default: '30d',
              description: '统计周期'
            },
          },
        },
      },

      // 构建环境和缓存
      {
        name: 'coding_ci_list_build_environments',
        description: '获取构建环境列表',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'coding_ci_clear_build_cache',
        description: '清理构建缓存',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'number', description: '任务 ID' },
            cacheType: { 
              type: 'string', 
              enum: ['ALL', 'DEPENDENCY', 'DOCKER'],
              default: 'ALL',
              description: '缓存类型'
            },
          },
          required: ['jobId'],
        },
      },

      // 构建制品
      {
        name: 'coding_ci_list_build_artifacts',
        description: '获取构建制品列表',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
          },
          required: ['buildId'],
        },
      },
      {
        name: 'coding_ci_download_build_artifact',
        description: '下载构建制品',
        inputSchema: {
          type: 'object',
          properties: {
            buildId: { type: 'number', description: '构建 ID' },
            artifactName: { type: 'string', description: '制品名称' },
          },
          required: ['buildId', 'artifactName'],
        },
      },
    ];
  }

  /**
   * 执行 CI/Build 工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      // 构建任务管理
      case 'coding_ci_list_jobs':
        return this.listJobs(args);
      case 'coding_ci_get_job':
        return this.getJob(args.jobId);
      case 'coding_ci_create_job':
        return this.createJob(args);
      case 'coding_ci_update_job':
        return this.updateJob(args);
      case 'coding_ci_delete_job':
        return this.deleteJob(args.jobId);

      // 构建记录管理
      case 'coding_ci_list_builds':
        return this.listBuilds(args);
      case 'coding_ci_get_build':
        return this.getBuild(args.buildId);
      case 'coding_ci_trigger_build':
        return this.triggerBuild(args);
      case 'coding_ci_stop_build':
        return this.stopBuild(args.buildId);
      case 'coding_ci_restart_build':
        return this.restartBuild(args.buildId);

      // 构建步骤管理
      case 'coding_ci_list_build_steps':
        return this.listBuildSteps(args.buildId);
      case 'coding_ci_get_build_step':
        return this.getBuildStep(args.stepId);

      // 构建日志管理
      case 'coding_ci_get_build_log':
        return this.getBuildLog(args);
      case 'coding_ci_get_build_step_log':
        return this.getBuildStepLog(args);
      case 'coding_ci_get_raw_build_log':
        return this.getRawBuildLog(args.buildId);

      // 构建统计和分析
      case 'coding_ci_get_build_statistics':
        return this.getBuildStatistics(args);
      case 'coding_ci_get_build_trends':
        return this.getBuildTrends(args);

      // 构建环境和缓存
      case 'coding_ci_list_build_environments':
        return this.listBuildEnvironments();
      case 'coding_ci_clear_build_cache':
        return this.clearBuildCache(args);

      // 构建制品
      case 'coding_ci_list_build_artifacts':
        return this.listBuildArtifacts(args.buildId);
      case 'coding_ci_download_build_artifact':
        return this.downloadBuildArtifact(args);

      default:
        throw new Error(`未知的 CI/Build 工具: ${toolName}`);
    }
  }

  // ===== 构建任务管理实现 =====

  private async listJobs(args: any): Promise<PaginatedResponse<CiJob>> {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.projectId) params.ProjectId = args.projectId;
    if (args.keyword) params.Keyword = args.keyword;

    return this.apiClient.request<PaginatedResponse<CiJob>>(
      'DescribeCodingCIJobs',
      params,
      { module: 'ci-build' }
    );
  }

  private async getJob(jobId: number): Promise<CiJob> {
    const response = await this.apiClient.request<{ Job: CiJob }>(
      'DescribeCodingCIJob',
      { JobId: jobId },
      { module: 'ci-build' }
    );
    return response.Job;
  }

  private async createJob(args: any): Promise<CiJob> {
    const response = await this.apiClient.request<{ Job: CiJob }>(
      'CreateCodingCIJob',
      {
        ProjectId: args.projectId,
        Name: args.name,
        DisplayName: args.displayName,
        DepotName: args.depotName,
        TriggerMethod: args.triggerMethod || 'MANUAL',
        Branch: args.branch || 'master',
        JenkinsFileFromType: args.jenkinsFileFromType || 'SCM',
        JenkinsFilePath: args.jenkinsFilePath || 'Jenkinsfile',
        ...(args.description && { Description: args.description }),
        ...(args.config && { Config: args.config }),
      },
      { module: 'ci-build' }
    );
    return response.Job;
  }

  private async updateJob(args: any): Promise<CiJob> {
    const params: any = { JobId: args.jobId };
    
    if (args.displayName) params.DisplayName = args.displayName;
    if (args.description) params.Description = args.description;
    if (args.triggerMethod) params.TriggerMethod = args.triggerMethod;
    if (args.branch) params.Branch = args.branch;
    if (args.config) params.Config = args.config;

    const response = await this.apiClient.request<{ Job: CiJob }>(
      'ModifyCodingCIJob',
      params,
      { module: 'ci-build' }
    );
    return response.Job;
  }

  private async deleteJob(jobId: number): Promise<boolean> {
    await this.apiClient.request(
      'DeleteCodingCIJob',
      { JobId: jobId },
      { module: 'ci-build' }
    );
    return true;
  }

  // ===== 构建记录管理实现 =====

  private async listBuilds(args: any): Promise<PaginatedResponse<CiBuild>> {
    const params: any = {
      JobId: args.jobId,
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.status) params.Status = args.status;
    if (args.branch) params.Branch = args.branch;

    return this.apiClient.request<PaginatedResponse<CiBuild>>(
      'DescribeCodingCIBuilds',
      params,
      { module: 'ci-build' }
    );
  }

  private async getBuild(buildId: number): Promise<CiBuild> {
    const response = await this.apiClient.request<{ Build: CiBuild }>(
      'DescribeCodingCIBuild',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return response.Build;
  }

  private async triggerBuild(args: any): Promise<CiBuild> {
    const params: any = {
      JobId: args.jobId,
      Branch: args.branch || 'master',
    };

    if (args.commitSha) params.CommitSha = args.commitSha;
    if (args.parameters) params.Parameters = args.parameters;

    const response = await this.apiClient.request<{ Build: CiBuild }>(
      'TriggerCodingCIBuild',
      params,
      { module: 'ci-build' }
    );
    return response.Build;
  }

  private async stopBuild(buildId: number): Promise<boolean> {
    await this.apiClient.request(
      'StopCodingCIBuild',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return true;
  }

  private async restartBuild(buildId: number): Promise<CiBuild> {
    const response = await this.apiClient.request<{ Build: CiBuild }>(
      'RestartCodingCIBuild',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return response.Build;
  }

  // ===== 构建步骤管理实现 =====

  private async listBuildSteps(buildId: number): Promise<CiBuildStep[]> {
    const response = await this.apiClient.request<{ Steps: CiBuildStep[] }>(
      'DescribeCodingCIBuildSteps',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return response.Steps;
  }

  private async getBuildStep(stepId: number): Promise<CiBuildStep> {
    const response = await this.apiClient.request<{ Step: CiBuildStep }>(
      'DescribeCodingCIBuildStep',
      { StepId: stepId },
      { module: 'ci-build' }
    );
    return response.Step;
  }

  // ===== 构建日志管理实现 =====

  private async getBuildLog(args: any): Promise<CiBuildLog[]> {
    const params: any = {
      BuildId: args.buildId,
      StartLine: args.startLine || 1,
    };

    if (args.endLine) params.EndLine = args.endLine;
    if (args.format) params.Format = args.format;

    const response = await this.apiClient.request<{ Logs: CiBuildLog[] }>(
      'DescribeCodingCIBuildLog',
      params,
      { module: 'ci-build' }
    );
    return response.Logs;
  }

  private async getBuildStepLog(args: any): Promise<CiBuildLog[]> {
    const params: any = {
      StepId: args.stepId,
      StartLine: args.startLine || 1,
    };

    if (args.endLine) params.EndLine = args.endLine;

    const response = await this.apiClient.request<{ Logs: CiBuildLog[] }>(
      'DescribeCodingCIBuildStepLog',
      params,
      { module: 'ci-build' }
    );
    return response.Logs;
  }

  private async getRawBuildLog(buildId: number): Promise<string> {
    const response = await this.apiClient.request<{ RawLog: string }>(
      'DescribeCodingCIBuildLogRaw',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return response.RawLog;
  }

  // ===== 构建统计和分析实现 =====

  private async getBuildStatistics(args: any): Promise<any> {
    const params: any = {};

    if (args.jobId) params.JobId = args.jobId;
    if (args.projectId) params.ProjectId = args.projectId;
    if (args.startDate) params.StartDate = args.startDate;
    if (args.endDate) params.EndDate = args.endDate;

    return this.apiClient.request(
      'DescribeCodingCIBuildStatistics',
      params,
      { module: 'ci-build' }
    );
  }

  private async getBuildTrends(args: any): Promise<any> {
    const params: any = {
      Period: args.period || '30d',
    };

    if (args.jobId) params.JobId = args.jobId;
    if (args.projectId) params.ProjectId = args.projectId;

    return this.apiClient.request(
      'DescribeCodingCIBuildTrends',
      params,
      { module: 'ci-build' }
    );
  }

  // ===== 构建环境和缓存实现 =====

  private async listBuildEnvironments(): Promise<any> {
    return this.apiClient.request(
      'DescribeCodingCIBuildEnvironments',
      {},
      { module: 'ci-build' }
    );
  }

  private async clearBuildCache(args: any): Promise<boolean> {
    await this.apiClient.request(
      'ClearCodingCIBuildCache',
      {
        JobId: args.jobId,
        CacheType: args.cacheType || 'ALL',
      },
      { module: 'ci-build' }
    );
    return true;
  }

  // ===== 构建制品实现 =====

  private async listBuildArtifacts(buildId: number): Promise<any> {
    const response = await this.apiClient.request<{ Artifacts: any[] }>(
      'DescribeCodingCIBuildArtifacts',
      { BuildId: buildId },
      { module: 'ci-build' }
    );
    return response.Artifacts;
  }

  private async downloadBuildArtifact(args: any): Promise<{ downloadUrl: string }> {
    const response = await this.apiClient.request<{ DownloadUrl: string }>(
      'DescribeCodingCIBuildArtifactDownloadUrl',
      {
        BuildId: args.buildId,
        ArtifactName: args.artifactName,
      },
      { module: 'ci-build' }
    );
    return { downloadUrl: response.DownloadUrl };
  }
}
