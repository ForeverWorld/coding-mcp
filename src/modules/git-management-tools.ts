import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { 
  GitRepository, 
  GitCommit, 
  GitBranch, 
  GitFile, 
  GitTag,
  PaginatedResponse
} from '../types/comprehensive-types.js';

/**
 * Git 代码仓库管理工具
 * 涵盖仓库、提交、分支、文件、标签、合并等所有 Git 相关功能
 */
export class GitManagementTools {
  constructor(private apiClient: ComprehensiveApiClient) {}

  /**
   * 获取所有 Git 管理相关工具定义
   */
  getTools(): Tool[] {
    return [
      // 仓库管理
      {
        name: 'coding_git_list_repositories',
        description: '获取代码仓库列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            teamGlobalKey: { type: 'string', description: '团队标识' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            keyword: { type: 'string', description: '搜索关键词' },
          },
        },
      },
      {
        name: 'coding_git_get_repository',
        description: '获取代码仓库详情',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_create_repository',
        description: '创建代码仓库',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            name: { type: 'string', description: '仓库名称' },
            displayName: { type: 'string', description: '显示名称' },
            description: { type: 'string', description: '仓库描述' },
            visibility: { type: 'number', enum: [1, 2], default: 1, description: '可见性：1=私有，2=公开' },
            templateId: { type: 'number', description: '模板 ID' },
          },
          required: ['projectId', 'name'],
        },
      },
      {
        name: 'coding_git_delete_repository',
        description: '删除代码仓库',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_update_repository_name',
        description: '修改仓库名称',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '当前仓库名称' },
            newName: { type: 'string', description: '新仓库名称' },
          },
          required: ['projectId', 'depotName', 'newName'],
        },
      },
      {
        name: 'coding_git_update_repository_description',
        description: '修改仓库描述',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            description: { type: 'string', description: '新描述' },
          },
          required: ['projectId', 'depotName', 'description'],
        },
      },

      // 提交管理
      {
        name: 'coding_git_list_commits',
        description: '获取提交记录列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            ref: { type: 'string', description: '分支或标签名', default: 'master' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
            since: { type: 'string', description: '开始时间' },
            until: { type: 'string', description: '结束时间' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_get_commit',
        description: '获取提交详情',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            sha: { type: 'string', description: '提交 SHA' },
          },
          required: ['projectId', 'depotName', 'sha'],
        },
      },
      {
        name: 'coding_git_create_commit',
        description: '创建提交',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            branch: { type: 'string', description: '分支名称' },
            message: { type: 'string', description: '提交信息' },
            files: {
              type: 'array',
              description: '文件变更列表',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: '文件路径' },
                  content: { type: 'string', description: '文件内容' },
                  action: { type: 'string', enum: ['create', 'update', 'delete'], description: '操作类型' },
                },
                required: ['path', 'action'],
              },
            },
          },
          required: ['projectId', 'depotName', 'branch', 'message', 'files'],
        },
      },
      {
        name: 'coding_git_get_commit_diff',
        description: '获取提交差异',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            sha: { type: 'string', description: '提交 SHA' },
          },
          required: ['projectId', 'depotName', 'sha'],
        },
      },
      {
        name: 'coding_git_compare_commits',
        description: '比较两个提交',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            base: { type: 'string', description: '基础提交 SHA' },
            head: { type: 'string', description: '目标提交 SHA' },
          },
          required: ['projectId', 'depotName', 'base', 'head'],
        },
      },

      // 分支管理
      {
        name: 'coding_git_list_branches',
        description: '获取分支列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_get_branch',
        description: '获取分支详情',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            branchName: { type: 'string', description: '分支名称' },
          },
          required: ['projectId', 'depotName', 'branchName'],
        },
      },
      {
        name: 'coding_git_create_branch',
        description: '创建分支',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            branchName: { type: 'string', description: '新分支名称' },
            ref: { type: 'string', description: '基于的分支或提交 SHA', default: 'master' },
          },
          required: ['projectId', 'depotName', 'branchName'],
        },
      },
      {
        name: 'coding_git_delete_branch',
        description: '删除分支',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            branchName: { type: 'string', description: '分支名称' },
          },
          required: ['projectId', 'depotName', 'branchName'],
        },
      },
      {
        name: 'coding_git_get_default_branch',
        description: '获取默认分支',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_set_default_branch',
        description: '设置默认分支',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            branchName: { type: 'string', description: '分支名称' },
          },
          required: ['projectId', 'depotName', 'branchName'],
        },
      },

      // 文件管理
      {
        name: 'coding_git_list_files',
        description: '获取文件列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            ref: { type: 'string', description: '分支或提交 SHA', default: 'master' },
            path: { type: 'string', description: '文件路径', default: '' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_get_file',
        description: '获取文件内容',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            path: { type: 'string', description: '文件路径' },
            ref: { type: 'string', description: '分支或提交 SHA', default: 'master' },
          },
          required: ['projectId', 'depotName', 'path'],
        },
      },
      {
        name: 'coding_git_create_file',
        description: '创建文件',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            path: { type: 'string', description: '文件路径' },
            content: { type: 'string', description: '文件内容' },
            message: { type: 'string', description: '提交信息' },
            branch: { type: 'string', description: '分支名称', default: 'master' },
            encoding: { type: 'string', description: '编码方式', default: 'base64' },
          },
          required: ['projectId', 'depotName', 'path', 'content', 'message'],
        },
      },
      {
        name: 'coding_git_update_file',
        description: '更新文件',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            path: { type: 'string', description: '文件路径' },
            content: { type: 'string', description: '文件内容' },
            message: { type: 'string', description: '提交信息' },
            branch: { type: 'string', description: '分支名称', default: 'master' },
            sha: { type: 'string', description: '原文件的 SHA（可选）' },
          },
          required: ['projectId', 'depotName', 'path', 'content', 'message'],
        },
      },
      {
        name: 'coding_git_delete_file',
        description: '删除文件',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            path: { type: 'string', description: '文件路径' },
            message: { type: 'string', description: '提交信息' },
            branch: { type: 'string', description: '分支名称', default: 'master' },
          },
          required: ['projectId', 'depotName', 'path', 'message'],
        },
      },

      // 标签管理
      {
        name: 'coding_git_list_tags',
        description: '获取标签列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_create_tag',
        description: '创建标签',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            tagName: { type: 'string', description: '标签名称' },
            ref: { type: 'string', description: '基于的提交 SHA' },
            message: { type: 'string', description: '标签信息' },
          },
          required: ['projectId', 'depotName', 'tagName', 'ref'],
        },
      },

      // 其他功能
      {
        name: 'coding_git_get_contributors',
        description: '获取贡献者列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
          },
          required: ['projectId', 'depotName'],
        },
      },
      {
        name: 'coding_git_search_code',
        description: '搜索代码',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            keyword: { type: 'string', description: '搜索关键词' },
            ref: { type: 'string', description: '分支名称', default: 'master' },
            pageNumber: { type: 'number', default: 1 },
            pageSize: { type: 'number', default: 20 },
          },
          required: ['projectId', 'depotName', 'keyword'],
        },
      },
      {
        name: 'coding_git_get_tree',
        description: '获取目录树',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            sha: { type: 'string', description: '树对象 SHA' },
            recursive: { type: 'boolean', default: false, description: '是否递归获取' },
          },
          required: ['projectId', 'depotName', 'sha'],
        },
      },
      {
        name: 'coding_git_get_blame',
        description: '获取文件的 blame 信息',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'number', description: '项目 ID' },
            depotName: { type: 'string', description: '仓库名称' },
            path: { type: 'string', description: '文件路径' },
            ref: { type: 'string', description: '分支或提交 SHA', default: 'master' },
          },
          required: ['projectId', 'depotName', 'path'],
        },
      },
    ];
  }

  /**
   * 执行 Git 管理工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      // 仓库管理
      case 'coding_git_list_repositories':
        return this.listRepositories(args);
      case 'coding_git_get_repository':
        return this.getRepository(args);
      case 'coding_git_create_repository':
        return this.createRepository(args);
      case 'coding_git_delete_repository':
        return this.deleteRepository(args);
      case 'coding_git_update_repository_name':
        return this.updateRepositoryName(args);
      case 'coding_git_update_repository_description':
        return this.updateRepositoryDescription(args);

      // 提交管理
      case 'coding_git_list_commits':
        return this.listCommits(args);
      case 'coding_git_get_commit':
        return this.getCommit(args);
      case 'coding_git_create_commit':
        return this.createCommit(args);
      case 'coding_git_get_commit_diff':
        return this.getCommitDiff(args);
      case 'coding_git_compare_commits':
        return this.compareCommits(args);

      // 分支管理
      case 'coding_git_list_branches':
        return this.listBranches(args);
      case 'coding_git_get_branch':
        return this.getBranch(args);
      case 'coding_git_create_branch':
        return this.createBranch(args);
      case 'coding_git_delete_branch':
        return this.deleteBranch(args);
      case 'coding_git_get_default_branch':
        return this.getDefaultBranch(args);
      case 'coding_git_set_default_branch':
        return this.setDefaultBranch(args);

      // 文件管理
      case 'coding_git_list_files':
        return this.listFiles(args);
      case 'coding_git_get_file':
        return this.getFile(args);
      case 'coding_git_create_file':
        return this.createFile(args);
      case 'coding_git_update_file':
        return this.updateFile(args);
      case 'coding_git_delete_file':
        return this.deleteFile(args);

      // 标签管理
      case 'coding_git_list_tags':
        return this.listTags(args);
      case 'coding_git_create_tag':
        return this.createTag(args);

      // 其他功能
      case 'coding_git_get_contributors':
        return this.getContributors(args);
      case 'coding_git_search_code':
        return this.searchCode(args);
      case 'coding_git_get_tree':
        return this.getTree(args);
      case 'coding_git_get_blame':
        return this.getBlame(args);

      default:
        throw new Error(`未知的 Git 管理工具: ${toolName}`);
    }
  }

  // ===== 仓库管理实现 =====

  private async listRepositories(args: any): Promise<any> {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.projectId) params.ProjectId = args.projectId;
    if (args.teamGlobalKey) params.TeamGlobalKey = args.teamGlobalKey;
    if (args.keyword) params.Keyword = args.keyword;

    if (args.projectId) {
      return this.apiClient.request('DescribeProjectDepotInfoList', params, { module: 'git-management' });
    } else if (args.teamGlobalKey) {
      return this.apiClient.request('DescribeTeamDepotInfoList', params, { module: 'git-management' });
    } else {
      return this.apiClient.request('DescribeMyDepots', params, { module: 'git-management' });
    }
  }

  private async getRepository(args: any): Promise<GitRepository> {
    const response = await this.apiClient.request<{ Depot: GitRepository }>(
      'DescribeGitDepot',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
      },
      { module: 'git-management' }
    );
    return response.Depot;
  }

  private async createRepository(args: any): Promise<GitRepository> {
    const params: any = {
      ProjectId: args.projectId,
      Name: args.name,
    };

    if (args.displayName) params.DisplayName = args.displayName;
    if (args.description) params.Description = args.description;
    if (args.visibility) params.Visibility = args.visibility;
    if (args.templateId) params.TemplateId = args.templateId;

    const response = await this.apiClient.request<{ Depot: GitRepository }>(
      'CreateGitDepot',
      params,
      { module: 'git-management' }
    );
    return response.Depot;
  }

  private async deleteRepository(args: any): Promise<boolean> {
    await this.apiClient.request(
      'DeleteGitDepot',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
      },
      { module: 'git-management' }
    );
    return true;
  }

  private async updateRepositoryName(args: any): Promise<boolean> {
    await this.apiClient.request(
      'ModifyDepotName',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        NewName: args.newName,
      },
      { module: 'git-management' }
    );
    return true;
  }

  private async updateRepositoryDescription(args: any): Promise<boolean> {
    await this.apiClient.request(
      'ModifyDepotDescription',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Description: args.description,
      },
      { module: 'git-management' }
    );
    return true;
  }

  // ===== 提交管理实现 =====

  private async listCommits(args: any): Promise<PaginatedResponse<GitCommit>> {
    const params: any = {
      ProjectId: args.projectId,
      DepotName: args.depotName,
      Ref: args.ref || 'master',
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.since) params.Since = args.since;
    if (args.until) params.Until = args.until;

    return this.apiClient.request<PaginatedResponse<GitCommit>>(
      'DescribeGitCommitsInPage',
      params,
      { module: 'git-management' }
    );
  }

  private async getCommit(args: any): Promise<GitCommit> {
    const response = await this.apiClient.request<{ Commit: GitCommit }>(
      'DescribeGitCommitInfo',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Sha: args.sha,
      },
      { module: 'git-management' }
    );
    return response.Commit;
  }

  private async createCommit(args: any): Promise<GitCommit> {
    const response = await this.apiClient.request<{ Commit: GitCommit }>(
      'CreateGitCommit',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Branch: args.branch,
        Message: args.message,
        Files: args.files,
      },
      { module: 'git-management' }
    );
    return response.Commit;
  }

  private async getCommitDiff(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeGitCommitDiff',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Sha: args.sha,
      },
      { module: 'git-management' }
    );
  }

  private async compareCommits(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeDifferentBetweenTwoCommits',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Base: args.base,
        Head: args.head,
      },
      { module: 'git-management' }
    );
  }

  // ===== 分支管理实现 =====

  private async listBranches(args: any): Promise<PaginatedResponse<GitBranch>> {
    return this.apiClient.request<PaginatedResponse<GitBranch>>(
      'DescribeGitBranchList',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
      },
      { module: 'git-management' }
    );
  }

  private async getBranch(args: any): Promise<GitBranch> {
    const response = await this.apiClient.request<{ Branch: GitBranch }>(
      'DescribeGitBranch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        BranchName: args.branchName,
      },
      { module: 'git-management' }
    );
    return response.Branch;
  }

  private async createBranch(args: any): Promise<GitBranch> {
    const response = await this.apiClient.request<{ Branch: GitBranch }>(
      'CreateGitBranch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        BranchName: args.branchName,
        Ref: args.ref || 'master',
      },
      { module: 'git-management' }
    );
    return response.Branch;
  }

  private async deleteBranch(args: any): Promise<boolean> {
    await this.apiClient.request(
      'DeleteGitBranch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        BranchName: args.branchName,
      },
      { module: 'git-management' }
    );
    return true;
  }

  private async getDefaultBranch(args: any): Promise<string> {
    const response = await this.apiClient.request<{ DefaultBranch: string }>(
      'DescribeDepotDefaultBranch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
      },
      { module: 'git-management' }
    );
    return response.DefaultBranch;
  }

  private async setDefaultBranch(args: any): Promise<boolean> {
    await this.apiClient.request(
      'ModifyDefaultBranch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        BranchName: args.branchName,
      },
      { module: 'git-management' }
    );
    return true;
  }

  // ===== 文件管理实现 =====

  private async listFiles(args: any): Promise<GitFile[]> {
    const response = await this.apiClient.request<{ Files: GitFile[] }>(
      'DescribeGitFiles',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Ref: args.ref || 'master',
        Path: args.path || '',
      },
      { module: 'git-management' }
    );
    return response.Files;
  }

  private async getFile(args: any): Promise<GitFile> {
    const response = await this.apiClient.request<{ File: GitFile }>(
      'DescribeGitFile',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Path: args.path,
        Ref: args.ref || 'master',
      },
      { module: 'git-management' }
    );
    return response.File;
  }

  private async createFile(args: any): Promise<GitCommit> {
    const response = await this.apiClient.request<{ Commit: GitCommit }>(
      'CreateGitFiles',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Files: [{
          Path: args.path,
          Content: args.content,
          Encoding: args.encoding || 'base64',
        }],
        Message: args.message,
        Branch: args.branch || 'master',
      },
      { module: 'git-management' }
    );
    return response.Commit;
  }

  private async updateFile(args: any): Promise<GitCommit> {
    const params: any = {
      ProjectId: args.projectId,
      DepotName: args.depotName,
      Files: [{
        Path: args.path,
        Content: args.content,
      }],
      Message: args.message,
      Branch: args.branch || 'master',
    };

    if (args.sha) params.Files[0].Sha = args.sha;

    const response = await this.apiClient.request<{ Commit: GitCommit }>(
      'ModifyGitFiles',
      params,
      { module: 'git-management' }
    );
    return response.Commit;
  }

  private async deleteFile(args: any): Promise<GitCommit> {
    const response = await this.apiClient.request<{ Commit: GitCommit }>(
      'DeleteGitFiles',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Files: [{ Path: args.path }],
        Message: args.message,
        Branch: args.branch || 'master',
      },
      { module: 'git-management' }
    );
    return response.Commit;
  }

  // ===== 标签管理实现 =====

  private async listTags(args: any): Promise<PaginatedResponse<GitTag>> {
    return this.apiClient.request<PaginatedResponse<GitTag>>(
      'DescribeProjectDepotTags',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
      },
      { module: 'git-management' }
    );
  }

  private async createTag(args: any): Promise<GitTag> {
    const response = await this.apiClient.request<{ Tag: GitTag }>(
      'CreateGitTag',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        TagName: args.tagName,
        Ref: args.ref,
        ...(args.message && { Message: args.message }),
      },
      { module: 'git-management' }
    );
    return response.Tag;
  }

  // ===== 其他功能实现 =====

  private async getContributors(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeGitContributors',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
      },
      { module: 'git-management' }
    );
  }

  private async searchCode(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeCodeSearch',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Keyword: args.keyword,
        Ref: args.ref || 'master',
        PageNumber: args.pageNumber || 1,
        PageSize: args.pageSize || 20,
      },
      { module: 'git-management' }
    );
  }

  private async getTree(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeGitTree',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Sha: args.sha,
        Recursive: args.recursive || false,
      },
      { module: 'git-management' }
    );
  }

  private async getBlame(args: any): Promise<any> {
    return this.apiClient.request(
      'DescribeGitBlameInfo',
      {
        ProjectId: args.projectId,
        DepotName: args.depotName,
        Path: args.path,
        Ref: args.ref || 'master',
      },
      { module: 'git-management' }
    );
  }
}
