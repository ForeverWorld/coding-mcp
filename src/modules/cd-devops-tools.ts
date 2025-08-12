import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { 
  CdHostServerGroup, 
  CdCloudAccount, 
  CdPipeline, 
  CdApplication, 
  CdTask,
  PaginatedResponse
} from '../types/comprehensive-types.js';

/**
 * CD/DevOps 持续部署相关工具
 * 涵盖主机组、云账号、流水线、应用部署、任务管理等功能
 */
export class CdDevOpsTools {
  constructor(private apiClient: ComprehensiveApiClient) {}

  /**
   * 获取所有 CD/DevOps 相关工具定义
   */
  getTools(): Tool[] {
    return [
      // 主机组管理
      {
        name: 'coding_cd_list_host_server_groups',
        description: '获取主机组列表',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            keyword: { type: 'string', description: '搜索关键词' },
          },
        },
      },
      {
        name: 'coding_cd_get_host_server_group',
        description: '获取主机组详情',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '主机组 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_create_host_server_group',
        description: '创建主机组',
        inputSchema: {
          type: 'object',
          properties: {
            displayName: { type: 'string', description: '主机组名称' },
            agentMachineId: { type: 'number', description: '堡垒机 ID' },
            authMethod: { type: 'string', enum: ['PUBLIC_KEY', 'PASSWORD'], default: 'PUBLIC_KEY' },
            userName: { type: 'string', description: '用户名' },
            port: { type: 'number', default: 22 },
            ips: { type: 'array', items: { type: 'string' }, description: 'IP 地址列表' },
            labels: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' }
                }
              },
              description: '标签列表'
            },
            password: { type: 'string', description: 'SSH 密码（当认证方式为 PASSWORD 时）' },
          },
          required: ['displayName', 'agentMachineId', 'userName', 'ips'],
        },
      },
      {
        name: 'coding_cd_update_host_server_group',
        description: '更新主机组',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '主机组 ID' },
            displayName: { type: 'string', description: '主机组名称' },
            agentMachineId: { type: 'number', description: '堡垒机 ID' },
            authMethod: { type: 'string', enum: ['PUBLIC_KEY', 'PASSWORD'] },
            userName: { type: 'string', description: '用户名' },
            port: { type: 'number' },
            ips: { type: 'array', items: { type: 'string' } },
            labels: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_delete_host_server_group',
        description: '删除主机组',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '主机组 ID' },
          },
          required: ['id'],
        },
      },

      // 云账号管理
      {
        name: 'coding_cd_list_cloud_accounts',
        description: '获取云账号列表',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
        },
      },
      {
        name: 'coding_cd_create_cloud_account',
        description: '创建云账号',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '云账号名称' },
            type: { type: 'string', description: '云账号类型' },
            region: { type: 'string', description: '地域' },
            description: { type: 'string', description: '描述' },
            credentials: { type: 'object', description: '认证信息' },
          },
          required: ['name', 'type', 'region'],
        },
      },
      {
        name: 'coding_cd_update_cloud_account',
        description: '更新云账号',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '云账号 ID' },
            name: { type: 'string', description: '云账号名称' },
            description: { type: 'string', description: '描述' },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_delete_cloud_account',
        description: '删除云账号',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '云账号 ID' },
          },
          required: ['id'],
        },
      },

      // 流水线管理
      {
        name: 'coding_cd_list_pipelines',
        description: '获取流水线列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            status: { type: 'string', description: '流水线状态' },
          },
        },
      },
      {
        name: 'coding_cd_get_pipeline',
        description: '获取流水线详情',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '流水线 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_create_pipeline',
        description: '创建流水线',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '流水线名称' },
            displayName: { type: 'string', description: '显示名称' },
            description: { type: 'string', description: '描述' },
            triggerMethod: { type: 'string', description: '触发方式' },
            projectId: { type: 'number', description: '项目 ID' },
            config: { type: 'object', description: '流水线配置' },
          },
          required: ['name', 'displayName', 'projectId'],
        },
      },
      {
        name: 'coding_cd_update_pipeline',
        description: '更新流水线',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '流水线 ID' },
            displayName: { type: 'string', description: '显示名称' },
            description: { type: 'string', description: '描述' },
            config: { type: 'object', description: '流水线配置' },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_delete_pipeline',
        description: '删除流水线',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '流水线 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'coding_cd_cancel_pipeline',
        description: '取消流水线执行',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '流水线 ID' },
          },
          required: ['id'],
        },
      },

      // 应用管理
      {
        name: 'coding_cd_list_applications',
        description: '获取应用列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
        },
      },
      {
        name: 'coding_cd_get_application',
        description: '获取应用详情',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '应用 ID' },
          },
          required: ['id'],
        },
      },

      // 任务管理
      {
        name: 'coding_cd_create_task',
        description: '创建部署任务',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '任务名称' },
            type: { type: 'string', description: '任务类型' },
            pipelineId: { type: 'number', description: '流水线 ID' },
            applicationId: { type: 'number', description: '应用 ID' },
            config: { type: 'object', description: '任务配置' },
          },
          required: ['name', 'type', 'pipelineId', 'applicationId'],
        },
      },
      {
        name: 'coding_cd_get_task',
        description: '获取任务详情',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '任务 ID' },
          },
          required: ['id'],
        },
      },

      // 其他工具
      {
        name: 'coding_cd_list_agent_machines',
        description: '获取堡垒机列表',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
        },
      },
      {
        name: 'coding_cd_get_pipeline_configs',
        description: '获取流水线配置模板',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: '配置类型' },
          },
        },
      },
    ];
  }

  /**
   * 执行 CD/DevOps 工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    const module = 'cd-devops';
    
    switch (toolName) {
      // 主机组管理
      case 'coding_cd_list_host_server_groups':
        return this.listHostServerGroups(args);
      case 'coding_cd_get_host_server_group':
        return this.getHostServerGroup(args.id);
      case 'coding_cd_create_host_server_group':
        return this.createHostServerGroup(args);
      case 'coding_cd_update_host_server_group':
        return this.updateHostServerGroup(args);
      case 'coding_cd_delete_host_server_group':
        return this.deleteHostServerGroup(args.id);

      // 云账号管理
      case 'coding_cd_list_cloud_accounts':
        return this.listCloudAccounts(args);
      case 'coding_cd_create_cloud_account':
        return this.createCloudAccount(args);
      case 'coding_cd_update_cloud_account':
        return this.updateCloudAccount(args);
      case 'coding_cd_delete_cloud_account':
        return this.deleteCloudAccount(args.id);

      // 流水线管理
      case 'coding_cd_list_pipelines':
        return this.listPipelines(args);
      case 'coding_cd_get_pipeline':
        return this.getPipeline(args.id);
      case 'coding_cd_create_pipeline':
        return this.createPipeline(args);
      case 'coding_cd_update_pipeline':
        return this.updatePipeline(args);
      case 'coding_cd_delete_pipeline':
        return this.deletePipeline(args.id);
      case 'coding_cd_cancel_pipeline':
        return this.cancelPipeline(args.id);

      // 应用管理
      case 'coding_cd_list_applications':
        return this.listApplications(args);
      case 'coding_cd_get_application':
        return this.getApplication(args.id);

      // 任务管理
      case 'coding_cd_create_task':
        return this.createTask(args);
      case 'coding_cd_get_task':
        return this.getTask(args.id);

      // 其他
      case 'coding_cd_list_agent_machines':
        return this.listAgentMachines(args);
      case 'coding_cd_get_pipeline_configs':
        return this.getPipelineConfigs(args);

      default:
        throw new Error(`未知的 CD/DevOps 工具: ${toolName}`);
    }
  }

  // ===== 主机组管理实现 =====

  private async listHostServerGroups(args: any): Promise<PaginatedResponse<CdHostServerGroup>> {
    const response = await this.apiClient.request<PaginatedResponse<CdHostServerGroup>>(
      'DescribeCdHostServerGroups',
      {
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
        ...(args.keyword && { Keyword: args.keyword }),
      },
      { module: 'cd-devops' }
    );
    return response;
  }

  private async getHostServerGroup(id: number): Promise<CdHostServerGroup> {
    const response = await this.apiClient.request<{ HostServerGroup: CdHostServerGroup }>(
      'DescribeCdHostServerGroup',
      { Id: id },
      { module: 'cd-devops' }
    );
    return response.HostServerGroup;
  }

  private async createHostServerGroup(args: any): Promise<CdHostServerGroup> {
    const response = await this.apiClient.request<{ HostServerGroup: CdHostServerGroup }>(
      'CreateCdHostServerGroup',
      {
        DisplayName: args.displayName,
        AgentMachineId: args.agentMachineId,
        AuthMethod: args.authMethod || 'PUBLIC_KEY',
        UserName: args.userName,
        Port: args.port || 22,
        Ips: args.ips,
        ...(args.labels && { Labels: args.labels }),
        ...(args.password && { Password: args.password }),
      },
      { module: 'cd-devops' }
    );
    return response.HostServerGroup;
  }

  private async updateHostServerGroup(args: any): Promise<CdHostServerGroup> {
    const params: any = { Id: args.id };
    
    if (args.displayName) params.DisplayName = args.displayName;
    if (args.agentMachineId) params.AgentMachineId = args.agentMachineId;
    if (args.authMethod) params.AuthMethod = args.authMethod;
    if (args.userName) params.UserName = args.userName;
    if (args.port) params.Port = args.port;
    if (args.ips) params.Ips = args.ips;
    if (args.labels) params.Labels = args.labels;

    const response = await this.apiClient.request<{ HostServerGroup: CdHostServerGroup }>(
      'ModifyCdHostServerGroup',
      params,
      { module: 'cd-devops' }
    );
    return response.HostServerGroup;
  }

  private async deleteHostServerGroup(id: number): Promise<boolean> {
    await this.apiClient.request(
      'DeleteCdHostServerGroup',
      { Id: id },
      { module: 'cd-devops' }
    );
    return true;
  }

  // ===== 云账号管理实现 =====

  private async listCloudAccounts(args: any): Promise<PaginatedResponse<CdCloudAccount>> {
    const response = await this.apiClient.request<PaginatedResponse<CdCloudAccount>>(
      'DescribeCdCloudAccounts',
      {
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
      },
      { module: 'cd-devops' }
    );
    return response;
  }

  private async createCloudAccount(args: any): Promise<CdCloudAccount> {
    const response = await this.apiClient.request<{ CloudAccount: CdCloudAccount }>(
      'CreateCdCloudAccount',
      {
        Name: args.name,
        Type: args.type,
        Region: args.region,
        ...(args.description && { Description: args.description }),
        ...(args.credentials && { Credentials: args.credentials }),
      },
      { module: 'cd-devops' }
    );
    return response.CloudAccount;
  }

  private async updateCloudAccount(args: any): Promise<CdCloudAccount> {
    const params: any = { Id: args.id };
    
    if (args.name) params.Name = args.name;
    if (args.description) params.Description = args.description;

    const response = await this.apiClient.request<{ CloudAccount: CdCloudAccount }>(
      'ModifyCdCloudAccount',
      params,
      { module: 'cd-devops' }
    );
    return response.CloudAccount;
  }

  private async deleteCloudAccount(id: number): Promise<boolean> {
    await this.apiClient.request(
      'DeleteCdCloudAccount',
      { Id: id },
      { module: 'cd-devops' }
    );
    return true;
  }

  // ===== 流水线管理实现 =====

  private async listPipelines(args: any): Promise<PaginatedResponse<CdPipeline>> {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.projectId) params.ProjectId = args.projectId;
    if (args.status) params.Status = args.status;

    const response = await this.apiClient.request<PaginatedResponse<CdPipeline>>(
      'DescribeCdPipelines',
      params,
      { module: 'cd-devops' }
    );
    return response;
  }

  private async getPipeline(id: number): Promise<CdPipeline> {
    const response = await this.apiClient.request<{ Pipeline: CdPipeline }>(
      'DescribeCdPipeline',
      { Id: id },
      { module: 'cd-devops' }
    );
    return response.Pipeline;
  }

  private async createPipeline(args: any): Promise<CdPipeline> {
    const response = await this.apiClient.request<{ Pipeline: CdPipeline }>(
      'CreateCdPipeline',
      {
        Name: args.name,
        DisplayName: args.displayName,
        ProjectId: args.projectId,
        ...(args.description && { Description: args.description }),
        ...(args.triggerMethod && { TriggerMethod: args.triggerMethod }),
        ...(args.config && { Config: args.config }),
      },
      { module: 'cd-devops' }
    );
    return response.Pipeline;
  }

  private async updatePipeline(args: any): Promise<CdPipeline> {
    const params: any = { Id: args.id };
    
    if (args.displayName) params.DisplayName = args.displayName;
    if (args.description) params.Description = args.description;
    if (args.config) params.Config = args.config;

    const response = await this.apiClient.request<{ Pipeline: CdPipeline }>(
      'ModifyCdPipeline',
      params,
      { module: 'cd-devops' }
    );
    return response.Pipeline;
  }

  private async deletePipeline(id: number): Promise<boolean> {
    await this.apiClient.request(
      'DeleteCdPipeline',
      { Id: id },
      { module: 'cd-devops' }
    );
    return true;
  }

  private async cancelPipeline(id: number): Promise<boolean> {
    await this.apiClient.request(
      'CancelCdPipeline',
      { Id: id },
      { module: 'cd-devops' }
    );
    return true;
  }

  // ===== 应用管理实现 =====

  private async listApplications(args: any): Promise<PaginatedResponse<CdApplication>> {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.projectId) params.ProjectId = args.projectId;

    const response = await this.apiClient.request<PaginatedResponse<CdApplication>>(
      'DescribeCdApplications',
      params,
      { module: 'cd-devops' }
    );
    return response;
  }

  private async getApplication(id: number): Promise<CdApplication> {
    const response = await this.apiClient.request<{ Application: CdApplication }>(
      'DescribeCdApplication',
      { Id: id },
      { module: 'cd-devops' }
    );
    return response.Application;
  }

  // ===== 任务管理实现 =====

  private async createTask(args: any): Promise<CdTask> {
    const response = await this.apiClient.request<{ Task: CdTask }>(
      'CreateCdTask',
      {
        Name: args.name,
        Type: args.type,
        PipelineId: args.pipelineId,
        ApplicationId: args.applicationId,
        ...(args.config && { Config: args.config }),
      },
      { module: 'cd-devops' }
    );
    return response.Task;
  }

  private async getTask(id: number): Promise<CdTask> {
    const response = await this.apiClient.request<{ Task: CdTask }>(
      'DescribeCdTask',
      { Id: id },
      { module: 'cd-devops' }
    );
    return response.Task;
  }

  // ===== 其他功能实现 =====

  private async listAgentMachines(args: any): Promise<any> {
    const response = await this.apiClient.request(
      'DescribeCdAgentMachines',
      {
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
      },
      { module: 'cd-devops' }
    );
    return response;
  }

  private async getPipelineConfigs(args: any): Promise<any> {
    const response = await this.apiClient.request(
      'DescribeCdPipelineConfigs',
      {
        ...(args.type && { Type: args.type }),
      },
      { module: 'cd-devops' }
    );
    return response;
  }
}
