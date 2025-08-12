import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodingApiClient } from '../api-client.js';
import type { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { ProjectInfo } from '../types.js';

/**
 * 项目相关的 MCP 工具
 */
export class ProjectTools {
  constructor(private apiClient: CodingApiClient | ComprehensiveApiClient) {}

  /**
   * 获取所有项目相关的工具定义
   */
  getTools(): Tool[] {
    return [
      {
        name: 'coding_list_projects',
        description: '获取项目列表',
        inputSchema: {
          type: 'object',
          properties: {
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符（可选）',
            },
            pageNumber: {
              type: 'number',
              description: '页码，默认为 1',
              default: 1,
            },
            pageSize: {
              type: 'number',
              description: '每页数量，默认为 20',
              default: 20,
            },
            keyword: {
              type: 'string',
              description: '搜索关键词（可选）',
            },
            visibility: {
              type: 'number',
              description: '项目可见性（1=私有，2=公开）',
              enum: [1, 2],
            },
          },
          required: [],
        },
      },
      {
        name: 'coding_get_project',
        description: '获取指定项目的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            projectName: {
              type: 'string',
              description: '项目名称（可选，与 projectId 二选一）',
            },
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符（使用 projectName 时必填）',
            },
          },
          anyOf: [
            { required: ['projectId'] },
            { required: ['projectName', 'teamGlobalKey'] },
          ],
        },
      },
      {
        name: 'coding_create_project',
        description: '创建新项目',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '项目名称（英文名，用于 URL）',
            },
            displayName: {
              type: 'string',
              description: '项目显示名称',
            },
            description: {
              type: 'string',
              description: '项目描述',
            },
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符',
            },
            visibility: {
              type: 'number',
              description: '项目可见性（1=私有，2=公开），默认为 1',
              enum: [1, 2],
              default: 1,
            },
            type: {
              type: 'string',
              description: '项目类型，默认为 CodingProject',
              default: 'CodingProject',
            },
          },
          required: ['name', 'displayName', 'teamGlobalKey'],
        },
      },
      {
        name: 'coding_update_project',
        description: '更新项目信息',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            displayName: {
              type: 'string',
              description: '项目显示名称',
            },
            description: {
              type: 'string',
              description: '项目描述',
            },
            icon: {
              type: 'string',
              description: '项目图标 URL',
            },
            visibility: {
              type: 'number',
              description: '项目可见性（1=私有，2=公开）',
              enum: [1, 2],
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coding_delete_project',
        description: '删除项目',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coding_get_project_members',
        description: '获取项目成员列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            pageNumber: {
              type: 'number',
              description: '页码，默认为 1',
              default: 1,
            },
            pageSize: {
              type: 'number',
              description: '每页数量，默认为 20',
              default: 20,
            },
          },
          required: ['projectId'],
        },
      },
    ];
  }

  /**
   * 执行项目工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'coding_list_projects':
        return this.listProjects(args);
      
      case 'coding_get_project':
        return this.getProject(args);
      
      case 'coding_create_project':
        return this.createProject(args);
      
      case 'coding_update_project':
        return this.updateProject(args);
      
      case 'coding_delete_project':
        return this.deleteProject(args.projectId);
      
      case 'coding_get_project_members':
        return this.getProjectMembers(args);
      
      default:
        throw new Error(`未知的项目工具: ${toolName}`);
    }
  }

  /**
   * 获取项目列表
   */
  private async listProjects(args: {
    teamGlobalKey?: string;
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
    visibility?: number;
  }) {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.teamGlobalKey) params.TeamGlobalKey = args.teamGlobalKey;
    if (args.keyword) params.Keyword = args.keyword;
    if (args.visibility) params.Visibility = args.visibility;

    const response = await this.apiClient.request<{
      TotalCount: number;
      PageNumber: number;
      PageSize: number;
      Projects: ProjectInfo[];
    }>('DescribeCodingProjects', params);

    return {
      totalCount: response.TotalCount,
      pageNumber: response.PageNumber,
      pageSize: response.PageSize,
      projects: response.Projects,
    };
  }

  /**
   * 获取项目详细信息
   */
  private async getProject(args: {
    projectId?: number;
    projectName?: string;
    teamGlobalKey?: string;
  }): Promise<ProjectInfo> {
    const params: any = {};

    if (args.projectId) {
      params.ProjectId = args.projectId;
    } else if (args.projectName && args.teamGlobalKey) {
      params.ProjectName = args.projectName;
      params.TeamGlobalKey = args.teamGlobalKey;
    } else {
      throw new Error('必须提供 projectId 或 (projectName + teamGlobalKey) 参数');
    }

    const response = await this.apiClient.request<{ Project: ProjectInfo }>('DescribeCodingProject', params);
    return response.Project;
  }

  /**
   * 创建项目
   */
  private async createProject(args: {
    name: string;
    displayName: string;
    description?: string;
    teamGlobalKey: string;
    visibility?: number;
    type?: string;
  }): Promise<ProjectInfo> {
    const params = {
      Name: args.name,
      DisplayName: args.displayName,
      TeamGlobalKey: args.teamGlobalKey,
      Visibility: args.visibility || 1,
      Type: args.type || 'CodingProject',
      ...(args.description && { Description: args.description }),
    };

    const response = await this.apiClient.request<{ Project: ProjectInfo }>('CreateCodingProject', params);
    return response.Project;
  }

  /**
   * 更新项目信息
   */
  private async updateProject(args: {
    projectId: number;
    displayName?: string;
    description?: string;
    icon?: string;
    visibility?: number;
  }): Promise<ProjectInfo> {
    const params: any = {
      ProjectId: args.projectId,
    };

    if (args.displayName) params.DisplayName = args.displayName;
    if (args.description) params.Description = args.description;
    if (args.icon) params.Icon = args.icon;
    if (args.visibility) params.Visibility = args.visibility;

    const response = await this.apiClient.request<{ Project: ProjectInfo }>('ModifyCodingProject', params);
    return response.Project;
  }

  /**
   * 删除项目
   */
  private async deleteProject(projectId: number): Promise<boolean> {
    const params = {
      ProjectId: projectId,
    };

    await this.apiClient.request('DeleteCodingProject', params);
    return true;
  }

  /**
   * 获取项目成员
   */
  private async getProjectMembers(args: {
    projectId: number;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const params = {
      ProjectId: args.projectId,
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    const response = await this.apiClient.request<{
      TotalCount: number;
      PageNumber: number;
      PageSize: number;
      Members: Array<{
        UserId: number;
        UserGlobalKey: string;
        UserName: string;
        UserAvatar: string;
        UserEmail: string;
        Role: string;
        JoinedAt: number;
      }>;
    }>('DescribeCodingProjectMembers', params);

    return {
      totalCount: response.TotalCount,
      pageNumber: response.PageNumber,
      pageSize: response.PageSize,
      members: response.Members,
    };
  }
}
