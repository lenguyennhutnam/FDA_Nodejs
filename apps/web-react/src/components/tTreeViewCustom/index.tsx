import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Paper,
  Chip,
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Person,
  CheckCircle,
  Cancel,
  AccessTime,
} from "@mui/icons-material";

interface TreeNode {
  id: string;
  label: React.ReactNode;
  children?: TreeNode[];
}

interface TTreeViewCustomProps {
  options: TreeNode[];
  selectedItems?: string[];
  onChange?: (selectedIds: string[], labels: any[]) => void;
  checkboxSelection?: boolean;
  multiSelect?: boolean;
}

const TTreeViewCustom: React.FC<TTreeViewCustomProps> = ({
  options,
  selectedItems = [],
  onChange,
  checkboxSelection = false,
  multiSelect = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedItems));

  // Update selected when selectedItems prop changes
  React.useEffect(() => {
    setSelected(new Set(selectedItems));
  }, [selectedItems]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSelected = (nodeId: string, nodeLabel: React.ReactNode) => {
    const newSelected = new Set(selected);
    
    if (multiSelect) {
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId);
      } else {
        newSelected.add(nodeId);
      }
    } else {
      newSelected.clear();
      newSelected.add(nodeId);
    }
    
    setSelected(newSelected);
    
    if (onChange) {
      const selectedIds = Array.from(newSelected);
      const selectedLabels = selectedIds.map(id => {
        const findLabel = (nodes: TreeNode[]): React.ReactNode => {
          for (const node of nodes) {
            if (node.id === id) return node.label;
            if (node.children) {
              const found = findLabel(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        return findLabel(options);
      });
      onChange(selectedIds, selectedLabels);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedItems.has(node.id);
    const isSelected = selected.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box key={node.id}>
        <Paper
          sx={{
            padding: "12px",
            marginBottom: "8px",
            marginLeft: `${level * 16}px`,
            backgroundColor: isSelected ? "#e3f2fd" : "white",
            cursor: "pointer",
            border: isSelected ? "2px solid #2196f3" : "1px solid #e0e0e0",
            "&:hover": {
              backgroundColor: isSelected ? "#e3f2fd" : "#f5f5f5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
            transition: "all 0.2s ease",
          }}
          onClick={() => toggleSelected(node.id, node.label)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                sx={{ 
                  padding: "4px",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" }
                }}
              >
                {isExpanded ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            )}
            {!hasChildren && <Box sx={{ width: "32px" }} />}
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {node.label}
            </Box>
          </Box>
        </Paper>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box>
              {node.children!.map((child) => renderNode(child, level + 1))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: 300, 
      minWidth: 300,
      maxHeight: 400,
      overflowY: 'auto',
      padding: '8px',
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      {options.map((node) => renderNode(node))}
    </Box>
  );
};

export { TTreeViewCustom };
