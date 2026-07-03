import { TroopStatus, TroopStatusLabels, UnitTreeNode } from "../../types/tbnv";

// Helper function để format số với số 0 phía trước
const formatNumber = (num: number): string => {
  if (num > 0 && num < 10) {
    return `0${num}`;
  }
  return num.toString();
};

/**
 * Tìm unit node từ tree theo ID (đệ quy)
 */
export const findUnitNode = (
  node: UnitTreeNode,
  unitId: string
): UnitTreeNode | null => {
  if (node._id === unitId) return node;
  if (node.childs) {
    for (const child of node.childs) {
      const found = findUnitNode(child, unitId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Generate text thống kê quân số theo format:
 * "Quân số [Tên đơn vị]: Có mặt: x/y, Vắng: k (trong đó ...)"
 */
export const generateTroopStatsSummaryText = (
  unitTree: UnitTreeNode | null,
  selectedUnitId: string | null,
  statusCounts: Record<TroopStatus, number>
): string => {
  if (!selectedUnitId || !unitTree) return "";

  const unitNode = findUnitNode(unitTree, selectedUnitId);
  if (!unitNode) return "";

  // Tính tổng quân số thực tế
  const totalCount = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  
  const coMat = statusCounts[TroopStatus.CoMat] || 0;
  const vang = totalCount - coMat;

  let text = `Quân số ${unitNode.name}: Có mặt: ${formatNumber(coMat)}/${formatNumber(totalCount)}`;


  if (vang > 0) {
    const vangDetails: string[] = [];

    if (statusCounts[TroopStatus.NghiPhep])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.NghiPhep]}: ${formatNumber(statusCounts[TroopStatus.NghiPhep])}`
      );
    if (statusCounts[TroopStatus.NghiOm])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.NghiOm]}: ${formatNumber(statusCounts[TroopStatus.NghiOm])}`
      );
    if (statusCounts[TroopStatus.DiVien])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.DiVien]}: ${formatNumber(statusCounts[TroopStatus.DiVien])}`
      );
    if (statusCounts[TroopStatus.CongTac])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.CongTac]}: ${formatNumber(statusCounts[TroopStatus.CongTac])}`
      );
    if (statusCounts[TroopStatus.DiHoc])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.DiHoc]}: ${formatNumber(statusCounts[TroopStatus.DiHoc])}`
      );
    if (statusCounts[TroopStatus.TranhThu])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.TranhThu]}: ${formatNumber(statusCounts[TroopStatus.TranhThu])}`
      );
    if (statusCounts[TroopStatus.NghiCuoiTuan])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.NghiCuoiTuan]}: ${formatNumber(statusCounts[TroopStatus.NghiCuoiTuan])}`
      );
    if (statusCounts[TroopStatus.ChinhSach])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.ChinhSach]}: ${formatNumber(statusCounts[TroopStatus.ChinhSach])}`
      );
    if (statusCounts[TroopStatus.TangCuong])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.TangCuong]}: ${formatNumber(statusCounts[TroopStatus.TangCuong])}`
      );
    if (statusCounts[TroopStatus.Khac])
      vangDetails.push(
        `${TroopStatusLabels[TroopStatus.Khac]}: ${formatNumber(statusCounts[TroopStatus.Khac])}`
      );
    // Không hiển thị dự nhiệm trong phần vắng

    text += `, Vắng: ${formatNumber(vang)}`;
    if (vangDetails.length > 0) {
      text += ` (Trong đó: ${vangDetails.join(", ")})`;
    }
  }

  return text;
};

/**
 * Get status color by TroopStatus
 */
export const getTroopStatusColor = (status: TroopStatus): string => {
  const colors = {
    [TroopStatus.CoMat]: "#43A047",
    [TroopStatus.NghiPhep]: "#FF9800",
    [TroopStatus.NghiOm]: "#E53935",
    [TroopStatus.DiVien]: "#9C27B0",
    [TroopStatus.TranhThu]: "#795548",
    [TroopStatus.NghiCuoiTuan]: "#607D8B",
    [TroopStatus.CongTac]: "#1976D2",
    [TroopStatus.ChinhSach]: "#673AB7",
    [TroopStatus.DiHoc]: "#00BCD4",
    [TroopStatus.Khac]: "#757575",
    [TroopStatus.TangCuong]: "#E91E63",
  };
  return colors[status] || "#757575";
};

