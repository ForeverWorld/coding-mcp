import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodingApiClient } from '../api-client.js';

/**
 * 事项（缺陷、需求、任务）相关的 MCP 工具
 */
export class IssueTools {
  constructor(private apiClient: CodingApiClient) {}

  /**
   * 获取所有事项相关的工具定义
   */
  getTools(): Tool[] {
    return [
      {
        name: 'coding_list_my_issues',
        description: '获取我负责的事项列表（包括缺陷、需求、任务等）',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID（可选，不填则查询所有项目）',
            },
            issueType: {
              type: 'string',
              description: '事项类型',
              enum: ['DEFECT', 'REQUIREMENT', 'TASK', 'EPIC', 'SUB_TASK'],
            },
            status: {
              type: 'string',
              description: '事项状态（可选）',
              enum: ['TODO', 'PROCESSING', 'TESTING', 'COMPLETED', 'CLOSED'],
            },
            priority: {
              type: 'string',
              description: '优先级（可选）',
              enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'],
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
          required: [],
        },
      },
      {
        name: 'coding_list_issues_assigned_to_me',
        description: '获取分配给我的事项列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID（可选）',
            },
            issueType: {
              type: 'string',
              description: '事项类型（可选）',
              enum: ['DEFECT', 'REQUIREMENT', 'TASK', 'EPIC', 'SUB_TASK'],
            },
            status: {
              type: 'string',
              description: '事项状态（可选）',
              enum: ['TODO', 'PROCESSING', 'TESTING', 'COMPLETED', 'CLOSED'],
            },
            pageNumber: {
              type: 'number',
              default: 1,
            },
            pageSize: {
              type: 'number',
              default: 20,
            },
          },
          required: [],
        },
      },
      {
        name: 'coding_get_defects_summary',
        description: '获取我的缺陷汇总信息（按状态统计）',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID（可选，不填则统计所有项目）',
            },
          },
          required: [],
        },
      },
      {
        name: 'coding_get_issue_detail',
        description: '获取事项详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            issueCode: {
              type: 'string',
              description: '事项编号（如：DEFECT-123）',
            },
          },
          required: ['projectId', 'issueCode'],
        },
      },
      {
        name: 'coding_create_issue',
        description: '创建新事项（缺陷、需求、任务等）',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            issueType: {
              type: 'string',
              description: '事项类型',
              enum: ['DEFECT', 'REQUIREMENT', 'TASK', 'EPIC', 'SUB_TASK'],
            },
            title: {
              type: 'string',
              description: '事项标题',
            },
            description: {
              type: 'string',
              description: '事项描述',
            },
            priority: {
              type: 'string',
              description: '优先级，默认为 MEDIUM',
              enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'],
              default: 'MEDIUM',
            },
            assigneeId: {
              type: 'number',
              description: '负责人 ID（可选）',
            },
          },
          required: ['projectId', 'issueType', 'title'],
        },
      },
      {
        name: 'coding_update_issue_status',
        description: '更新事项状态',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: '项目 ID',
            },
            issueCode: {
              type: 'string',
              description: '事项编号',
            },
            status: {
              type: 'string',
              description: '新状态',
              enum: ['TODO', 'PROCESSING', 'TESTING', 'COMPLETED', 'CLOSED'],
            },
          },
          required: ['projectId', 'issueCode', 'status'],
        },
      },
    ];
  }

  /**
   * 执行事项工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'coding_list_my_issues':
        return this.listMyIssues(args);
      
      case 'coding_list_issues_assigned_to_me':
        return this.listIssuesAssignedToMe(args);
      
      case 'coding_get_defects_summary':
        return this.getDefectsSummary(args);
      
      case 'coding_get_issue_detail':
        return this.getIssueDetail(args);
      
      case 'coding_create_issue':
        return this.createIssue(args);
      
      case 'coding_update_issue_status':
        return this.updateIssueStatus(args);
      
      default:
        throw new Error(`未知的事项工具: ${toolName}`);
    }
  }

  /**
   * 获取我负责的事项列表
   */
  private async listMyIssues(args: {
    projectId?: number;
    issueType?: string;
    status?: string;
    priority?: string;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
      AssigneeMe: true, // 查询分配给我的事项
    };

    if (args.projectId) params.ProjectId = args.projectId;
    if (args.issueType) params.IssueType = args.issueType;
    if (args.status) params.Status = args.status;
    if (args.priority) params.Priority = args.priority;

    const response = await this.apiClient.request<{
      TotalCount: number;
      PageNumber: number;
      PageSize: number;
      Issues: Array<{
        Code: string;
        Title: string;
        IssueType: string;
        Status: string;
        Priority: string;
        AssigneeId: number;
        AssigneeName: string;
        CreatorId: number;
        CreatorName: string;
        ProjectId: number;
        ProjectName: string;
        CreatedAt: number;
        UpdatedAt: number;
        Description?: string;
      }>;
    }>('DescribeCodingIssues', params);

    return {
      totalCount: response.TotalCount,
      pageNumber: response.PageNumber,
      pageSize: response.PageSize,
      issues: response.Issues,
    };
  }

  /**
   * 获取分配给我的事项列表
   */
  private async listIssuesAssignedToMe(args: {
    projectId?: number;
    issueType?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }) {
    // 复用 listMyIssues 的逻辑
    return this.listMyIssues(args);
  }

  /**
   * 获取缺陷汇总信息
   */
  private async getDefectsSummary(args: { projectId?: number }) {
    // 获取所有缺陷
    const allDefects = await this.listMyIssues({
      projectId: args.projectId,
      issueType: 'DEFECT',
      pageSize: 1000, // 获取尽可能多的数据用于统计
    });

    // 按状态分组统计
    const summary = {
      total: allDefects.totalCount,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byProject: {} as Record<string, number>,
    };

    allDefects.issues.forEach(issue => {
      // 按状态统计
      summary.byStatus[issue.Status] = (summary.byStatus[issue.Status] || 0) + 1;
      
      // 按优先级统计
      summary.byPriority[issue.Priority] = (summary.byPriority[issue.Priority] || 0) + 1;
      
      // 按项目统计
      summary.byProject[issue.ProjectName] = (summary.byProject[issue.ProjectName] || 0) + 1;
    });

    return {
      defectsSummary: summary,
      recentDefects: allDefects.issues.slice(0, 5), // 最近的5个缺陷
    };
  }

  /**
   * 获取事项详细信息
   */
  private async getIssueDetail(args: { projectId: number; issueCode: string }) {
    const params = {
      ProjectId: args.projectId,
      IssueCode: args.issueCode,
    };

    const response = await this.apiClient.request<{
      Issue: {
        Code: string;
        Title: string;
        Description: string;
        IssueType: string;
        Status: string;
        Priority: string;
        AssigneeId: number;
        AssigneeName: string;
        CreatorId: number;
        CreatorName: string;
        ProjectId: number;
        ProjectName: string;
        CreatedAt: number;
        UpdatedAt: number;
        Labels?: string[];
        Watchers?: Array<{Id: number; Name: string}>;
      };
    }>('DescribeCodingIssue', params);

    return response.Issue;
  }

  /**
   * 创建新事项
   */
  private async createIssue(args: {
    projectId: number;
    issueType: string;
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: number;
  }) {
    const params = {
      ProjectId: args.projectId,
      IssueType: args.issueType,
      Title: args.title,
      Priority: args.priority || 'MEDIUM',
      ...(args.description && { Description: args.description }),
      ...(args.assigneeId && { AssigneeId: args.assigneeId }),
    };

    const response = await this.apiClient.request<{
      Issue: {
        Code: string;
        Title: string;
        IssueType: string;
        Status: string;
        ProjectId: number;
        CreatedAt: number;
      };
    }>('CreateCodingIssue', params);

    return response.Issue;
  }

  /**
   * 更新事项状态
   */
  private async updateIssueStatus(args: {
    projectId: number;
    issueCode: string;
    status: string;
  }) {
    const params = {
      ProjectId: args.projectId,
      IssueCode: args.issueCode,
      Status: args.status,
    };

    const response = await this.apiClient.request<{
      Issue: {
        Code: string;
        Status: string;
        UpdatedAt: number;
      };
    }>('ModifyCodingIssueStatus', params);

    return {
      success: true,
      issue: response.Issue,
      message: `事项 ${args.issueCode} 状态已更新为 ${args.status}`,
    };
  }
}
