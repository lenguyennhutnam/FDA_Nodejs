// TimelineTask interface
export interface TimelineTask {
  _id: string;
  ten: string;
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
  tien_do: string;
  is_qua_han?: boolean; // Trạng thái quá hạn của nhiệm vụ
  ca_nhan?: {
    _id: string;
    full_name?: string;
    rank?: string;
  };
  loai_nhiem_vu?: {
    _id: string;
    ten: string;
    mo_ta?: string;
    mau_sac?: string;
    icon?: string;
    thu_tu?: number;
    trang_thai?: boolean;
    created_date?: string;
    last_update?: string;
    __v?: number;
  };
  children?: TimelineTask[];
  level?: number;
}

// TimelineChartProps interface
export interface TimelineChartProps {
  // === CORE DATA ===
  data: TimelineTask[];
  filteredData?: TimelineTask[];
  
  // === CHART CONFIGURATION ===
  height?: number;
  width?: string | number;
  showToolbar?: boolean;
  interactive?: boolean;
  
  // === INTERACTIONS ===
  onTaskClick?: (taskId: string) => void;
  onDataPointSelection?: (taskId: string, taskIndex: number) => void;
  
  // === FILTER FUNCTIONALITY ===
  showFilters?: boolean;
  searchable?: boolean;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  
  // === STATUS FILTERS ===
  statusFilter?: boolean;
  selectedStatus?: string[];
  onStatusChange?: (status: string[]) => void;
  
  // === DATE FILTERS ===
  dateRangeFilter?: boolean;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  
  // === TREE/EXPAND FUNCTIONALITY ===
  expandable?: boolean;
  expandedTasks?: Set<string>;
  onToggleExpand?: (taskId: string) => void;
  showSubTasks?: boolean;
  
  // === ASSIGNEE FILTERS ===
  assigneeFilter?: boolean;
  selectedAssignees?: string[];
  onAssigneeChange?: (assignees: string[]) => void;
  
  // === CUSTOM STYLING ===
  customColors?: Record<string, string>;
  showTooltip?: boolean;
  
  // === LOADING & ERROR ===
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  
  // === ADVANCED OPTIONS ===
  autoHeight?: boolean;
  minHeight?: number;
  maxHeight?: number;
  scrollable?: boolean;
  
  // === DISPLAY OPTIONS ===
  alignLeft?: boolean;
  wrapTaskNames?: boolean;
  showDataLabels?: boolean;
  enableZoom?: boolean;
  
  // === LAYOUT OPTIONS ===
  labelColumnWidth?: number;
  chartColumnWidth?: number;
}
