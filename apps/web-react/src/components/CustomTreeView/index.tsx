import {
  AccountCircle,
  Badge,
  Business,
  ChevronRight,
  ExpandMore,
  Face,
  MilitaryTech,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { useState } from "react";

interface TreeNode {
  id: string;
  label: string;
  type: "unit" | "user";
  children?: TreeNode[];
  userData?: any;
}

interface CustomTreeViewProps {
  data: TreeNode[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  expandedNodes?: string[];
  onExpandedNodesChange?: (expandedNodes: string[]) => void;
  defaultExpandedLevel?: number;
}

// Helper function to get user icon
const getUserIcon = (iconType: string = "account") => {
  const iconProps = { fontSize: "small" as const, sx: { color: "#1976d2" } };

  switch (iconType) {
    case "face":
      return <Face {...iconProps} />;
    case "badge":
      return <Badge {...iconProps} />;
    case "military":
      return <MilitaryTech {...iconProps} />;
    case "person":
      return <Person {...iconProps} />;
    default:
      return <AccountCircle {...iconProps} />;
  }
};

const CustomTreeView: React.FC<CustomTreeViewProps> = ({
  data,
  selectedItems,
  onSelectionChange,
  expandedNodes = [],
  onExpandedNodesChange,
  defaultExpandedLevel = 0,
}) => {
  const [internalExpandedNodes, setInternalExpandedNodes] =
    useState<string[]>(expandedNodes);

  // Use external expandedNodes if provided, otherwise use internal state
  const currentExpandedNodes =
    expandedNodes.length > 0 ? expandedNodes : internalExpandedNodes;

  const handleToggleExpand = (nodeId: string) => {
    if (onExpandedNodesChange) {
      onExpandedNodesChange(
        currentExpandedNodes.includes(nodeId)
          ? currentExpandedNodes.filter((id) => id !== nodeId)
          : [...currentExpandedNodes, nodeId]
      );
    } else {
      setInternalExpandedNodes((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId]
      );
    }
  };

  const handleCheckboxChange = (nodeId: string) => {
    const newSelection = selectedItems.includes(nodeId)
      ? selectedItems.filter((id) => id !== nodeId)
      : [...selectedItems, nodeId];
    onSelectionChange(newSelection);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded =
      currentExpandedNodes.includes(node.id) || level < defaultExpandedLevel;
    const isSelected = selectedItems.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box key={node.id}>
        <ListItem
          sx={{
            minHeight: 38,
            borderRadius: 2,
            mb: 0.5,
            p: 0,
            backgroundColor: isSelected ? "#e3f2fd" : "transparent",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <ListItemButton
            sx={{
              pl: 1 + level * 2,
              py: 0.5,
              minHeight: 38,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (node.type === "user") {
                // For user nodes, clicking the row toggles selection
                handleCheckboxChange(node.id);
              } else if (hasChildren) {
                // For unit nodes with children, clicking the row toggles expand
                handleToggleExpand(node.id);
              }
            }}
          >
            {/* Expand/Collapse Icon */}
            <ListItemIcon sx={{ minWidth: 32 }}>
              {hasChildren ? (
                isExpanded ? (
                  <ExpandMore
                    sx={{
                      fontSize: 20,
                    }}
                  />
                ) : (
                  <ChevronRight
                    sx={{
                      fontSize: 20,
                    }}
                  />
                )
              ) : (
                <Box sx={{ width: 20 }} />
              )}
            </ListItemIcon>

            <ListItemIcon sx={{ minWidth: 32 }}>
              {node.type === "user" ? (
                getUserIcon("account")
              ) : (
                <Business fontSize="small" sx={{ color: "#1976d2" }} />
              )}
            </ListItemIcon>

            <ListItemText
              primary={node.label}
              sx={{
                "& .MuiTypography-root": {
                  fontSize: "0.875rem",
                  fontWeight: node.type === "user" ? 500 : 600,
                  color: node.type === "user" ? "#333" : "#1a1a1a",
                },
              }}
            />

            {/* Single Checkbox */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 80,
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCheckboxChange(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                aria-label={`Chọn ${node.label}`}
                style={{
                  width: 20,
                  height: 20,
                  accentColor: "#1976d2",
                  cursor: "pointer",
                }}
              />
            </Box>
          </ListItemButton>
        </ListItem>

        {/* Children */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2 }}>
              {node.children?.map((child) =>
                renderTreeNode(child, level + 1)
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return <Box>{data.map((node) => renderTreeNode(node))}</Box>;
};

export default CustomTreeView;