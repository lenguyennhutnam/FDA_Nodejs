export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // Will use TienDoNhiemVu enum
  priority: TaskPriority;
  type: TaskType;
  assignee?: User;
  participants: User[];
  reporter: User;
  createdDate: string;
  updatedDate: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  estimatedTime?: number; // in hours
  actualTime?: number; // in hours
  labels: string[];
  components: string[];
  fixVersions: string[];
  environment?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  results?: string;
  evaluation?: string;
  epic?: Epic;
  sprint?: Sprint;
  parentTask?: Task;
  subTasks: Task[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  workflow: WorkflowStep[];
  watchers: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Epic {
  id: string;
  name: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

export interface TaskComment {
  id: string;
  content: string;
  author: User;
  createdDate: string;
  updatedDate?: string;
  isEdited: boolean;
  mentions?: User[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: User;
  uploadedDate: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: string; // Will use TienDoNhiemVu enum
  assignee?: User;
  completedDate?: string;
  comment?: string;
  isCompleted: boolean;
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  TESTING = "TESTING",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOWEST = "LOWEST",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  HIGHEST = "HIGHEST",
}

export enum TaskType {
  STORY = "STORY",
  TASK = "TASK",
  BUG = "BUG",
  EPIC = "EPIC",
  SUBTASK = "SUBTASK",
}

export enum SprintStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  FUTURE = "FUTURE",
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  dueDate?: string;
  estimatedTime?: number;
  labels: string[];
  components: string[];
  fixVersions: string[];
  environment?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  epicId?: string;
  sprintId?: string;
  parentTaskId?: string;
}

export interface CreateSubTaskData {
  title: string;
  description: string;
  assigneeId?: string;
  priority: TaskPriority;
  estimatedTime?: number;
}

export interface CreateCommentData {
  content: string;
  mentions?: string[];
}
