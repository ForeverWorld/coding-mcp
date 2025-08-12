import { z } from 'zod';

// ================================
// 核心配置和响应类型
// ================================

export const ComprehensiveConfigSchema = z.object({
  apiBaseUrl: z.string().url().default('https://e.coding.net/open-api'),
  personalAccessToken: z.string().min(1, '个人访问令牌不能为空'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().min(0).default(3),
  maxConcurrentRequests: z.number().positive().default(10),
  enableCache: z.boolean().default(false),
  cacheTTL: z.number().positive().default(300), // 5分钟
});

export type ComprehensiveConfig = z.infer<typeof ComprehensiveConfigSchema>;

// 通用 API 响应结构
export interface CodingApiResponse<T = any> {
  Response: {
    Error?: {
      Code: string;
      Message: string;
    };
    RequestId: string;
  } & T;
}

// ================================
// CD/DevOps 相关类型
// ================================

export interface CdHostServerGroup {
  Id: number;
  DisplayName: string;
  AgentMachineId: number;
  AuthMethod: 'PUBLIC_KEY' | 'PASSWORD';
  UserName: string;
  Port: number;
  Labels: Array<{ Key: string; Value: string }>;
  Ips: string[];
  Status: string;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface CdCloudAccount {
  Id: number;
  Name: string;
  Type: string;
  Region: string;
  Status: string;
  Description: string;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface CdPipeline {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Status: string;
  TriggerMethod: string;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface CdApplication {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Type: string;
  Status: string;
  ProjectId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface CdTask {
  Id: number;
  Name: string;
  Type: string;
  Status: string;
  PipelineId: number;
  ApplicationId: number;
  StartTime: number;
  EndTime: number;
  Duration: number;
}

// ================================
// Git 管理相关类型
// ================================

export interface GitRepository {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  ProjectId: number;
  HttpsUrl: string;
  SshUrl: string;
  DefaultBranch: string;
  Visibility: number;
  Size: number;
  CommitCount: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface GitCommit {
  Sha: string;
  Author: {
    Name: string;
    Email: string;
    Date: number;
  };
  Committer: {
    Name: string;
    Email: string;
    Date: number;
  };
  Message: string;
  Parents: string[];
  Tree: string;
  Stats: {
    Additions: number;
    Deletions: number;
    Total: number;
  };
}

export interface GitBranch {
  Name: string;
  Sha: string;
  Protected: boolean;
  Default: boolean;
  CommitCount: number;
  LastCommit: GitCommit;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface GitFile {
  Name: string;
  Path: string;
  Type: 'file' | 'dir';
  Size: number;
  Sha: string;
  Content?: string;
  Encoding?: string;
  LastCommit: GitCommit;
}

export interface GitTag {
  Name: string;
  Sha: string;
  Message: string;
  Tagger: {
    Name: string;
    Email: string;
    Date: number;
  };
  Target: {
    Type: string;
    Sha: string;
  };
}

// ================================
// 事项管理相关类型
// ================================

export interface Issue {
  Id: number;
  Code: string;
  Title: string;
  Description: string;
  IssueType: 'DEFECT' | 'REQUIREMENT' | 'TASK' | 'EPIC' | 'SUB_TASK';
  Status: 'TODO' | 'PROCESSING' | 'TESTING' | 'COMPLETED' | 'CLOSED';
  Priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
  AssigneeId: number;
  AssigneeName: string;
  CreatorId: number;
  CreatorName: string;
  ProjectId: number;
  ProjectName: string;
  ModuleId?: number;
  ModuleName?: string;
  IterationId?: number;
  IterationName?: string;
  Labels: string[];
  EstimatedTime?: number;
  SpentTime?: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface IssueComment {
  Id: number;
  Content: string;
  AuthorId: number;
  AuthorName: string;
  AuthorAvatar: string;
  IssueId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface IssueModule {
  Id: number;
  Name: string;
  Description: string;
  ProjectId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface IssueWorkLog {
  Id: number;
  Description: string;
  TimeSpent: number;
  UserId: number;
  UserName: string;
  IssueId: number;
  CreatedAt: number;
}

// ================================
// CI/Build 相关类型
// ================================

export interface CiJob {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Status: string;
  TriggerMethod: string;
  ProjectId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface CiBuild {
  Id: number;
  Number: number;
  Status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  TriggerMethod: string;
  Branch: string;
  CommitSha: string;
  CommitMessage: string;
  JobId: number;
  JobName: string;
  StartTime: number;
  EndTime: number;
  Duration: number;
}

export interface CiBuildStep {
  Id: number;
  Name: string;
  Status: string;
  StartTime: number;
  EndTime: number;
  Duration: number;
  Order: number;
  BuildId: number;
}

export interface CiBuildLog {
  Content: string;
  LineNumber: number;
  Timestamp: number;
  Level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}

// ================================
// 制品库相关类型
// ================================

export interface ArtifactRepository {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Type: 'DOCKER' | 'MAVEN' | 'NPM' | 'PYPI' | 'GENERIC';
  ProjectId: number;
  Size: number;
  PackageCount: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface ArtifactPackage {
  Id: number;
  Name: string;
  Version: string;
  Description: string;
  Size: number;
  DownloadCount: number;
  RepositoryId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface ArtifactVersion {
  Id: number;
  Version: string;
  Size: number;
  DownloadCount: number;
  PackageId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

// ================================
// Wiki 相关类型
// ================================

export interface Wiki {
  Id: number;
  Title: string;
  Content: string;
  ParentId?: number;
  ProjectId: number;
  CreatorId: number;
  CreatorName: string;
  Order: number;
  IsPublic: boolean;
  CreatedAt: number;
  UpdatedAt: number;
}

// ================================
// 用户和团队类型
// ================================

export interface User {
  Id: number;
  GlobalKey: string;
  Name: string;
  DisplayName: string;
  Email: string;
  Phone: string;
  Avatar: string;
  Status: number;
  TeamGlobalKey: string;
  TeamName: string;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface Team {
  Id: number;
  GlobalKey: string;
  Name: string;
  DisplayName: string;
  Avatar: string;
  Description: string;
  Location: string;
  Website: string;
  MemberCount: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface Project {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Icon: string;
  Type: string;
  Status: string;
  Visibility: number;
  TeamGlobalKey: string;
  CreatedAt: number;
  UpdatedAt: number;
}

// ================================
// Service Hook 相关类型
// ================================

export interface ServiceHook {
  Id: number;
  Name: string;
  Url: string;
  Events: string[];
  Status: string;
  Secret: string;
  ProjectId: number;
  CreatedAt: number;
  UpdatedAt: number;
}

export interface ServiceHookLog {
  Id: number;
  EventType: string;
  RequestUrl: string;
  RequestHeaders: Record<string, string>;
  RequestBody: string;
  ResponseStatus: number;
  ResponseHeaders: Record<string, string>;
  ResponseBody: string;
  Duration: number;
  HookId: number;
  CreatedAt: number;
}

// ================================
// 合并请求相关类型
// ================================

export interface MergeRequest {
  Id: number;
  Title: string;
  Description: string;
  SourceBranch: string;
  TargetBranch: string;
  Status: 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT';
  AuthorId: number;
  AuthorName: string;
  ProjectId: number;
  CreatedAt: number;
  UpdatedAt: number;
  MergedAt?: number;
}

// ================================
// 错误处理类型
// ================================

export class ComprehensiveCodingApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public requestId?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ComprehensiveCodingApiError';
  }
}

// ================================
// 通用请求参数类型
// ================================

export interface PaginationParams {
  PageNumber?: number;
  PageSize?: number;
}

export interface SortParams {
  SortBy?: string;
  SortOrder?: 'ASC' | 'DESC';
}

export interface FilterParams {
  Keyword?: string;
  StartTime?: number;
  EndTime?: number;
  Status?: string;
  Type?: string;
}

export interface CodingApiRequest {
  Action: string;
  [key: string]: any;
}

// ================================
// 响应包装类型
// ================================

export interface PaginatedResponse<T> {
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  Items: T[];
}

export interface ListResponse<T> {
  Items: T[];
  TotalCount: number;
}

export interface SingleResponse<T> {
  Item: T;
}

// ================================
// 工具配置类型
// ================================

export interface ToolConfig {
  name: string;
  description: string;
  module: string;
  enabled: boolean;
  permissions: string[];
}

export interface ModuleConfig {
  name: string;
  description: string;
  enabled: boolean;
  tools: ToolConfig[];
}

// ================================
// 缓存相关类型
// ================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ================================
// 监控和统计类型
// ================================

export interface ApiMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

export interface ModuleMetrics {
  [moduleName: string]: ApiMetrics;
}

export interface HealthStatus {
  healthy: boolean;
  uptime: number;
  version: string;
  modules: Record<string, boolean>;
  metrics: ModuleMetrics;
}
