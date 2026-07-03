import * as React from "react";
import Box from "@mui/material/Box";
import {RichTreeView} from "@mui/x-tree-view/RichTreeView";
import {toArray} from "../../utils/check";
import {useState} from "react";

// Helper function để convert JSX element thành string cho RichTreeView
const convertLabelToString = (label: any): string => {
  if (typeof label === 'string') {
    return label;
  }
  
  if (React.isValidElement(label)) {
    // Nếu là JSX element, extract text content
    const extractText = (element: React.ReactElement): string => {
      const children = (element.props as any).children;
      
      if (typeof children === 'string') {
        return children;
      }
      
      if (Array.isArray(children)) {
        return children
          .map((child) => {
            if (typeof child === 'string') return child;
            if (React.isValidElement(child)) return extractText(child);
            return '';
          })
          .join(' ');
      }
      
      if (React.isValidElement(children)) {
        return extractText(children);
      }
      
      return '';
    };
    
    return extractText(label);
  }
  
  return String(label || '');
};
type TreeViewProps = {
  onChange?: (ids, label) => void;
  options?: any[];
  checkboxSelection?: boolean;
  multiSelect?: boolean;
  selectedItems?: any[];
  onBlur?: any;
  expandedItems?: any[];
};
const TTreeView = (props: TreeViewProps) => {
  const {
    onChange,
    checkboxSelection,
    multiSelect = false,
    options = [],
    selectedItems: defaultSelectedItems = [],
    expandedItems: defaultExpandedItems = [],
  } = props;
  const [selectedItems, setSelectedItems] =
    React.useState<string[]>(defaultSelectedItems);
  const [expandedItems, setExpandedItems] = useState(defaultExpandedItems);

  // Force update selectedItems khi defaultSelectedItems thay đổi
  React.useEffect(() => {
    setSelectedItems(defaultSelectedItems);
  }, [defaultSelectedItems]);
  const findLabelById = (options, id) => {
    for (const item of options) {
      if (item?.id === id) {
        return convertLabelToString(item.label);
      }
      if (toArray(item?.children)?.length > 0) {
        const found = findLabelById(item?.children, id);
        if (found) return found;
      }
    }
    return "";
  };

  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: any) => {
    console.log(typeof ids, "typeof ids");
    if (multiSelect) {
      // Multiple selection: giữ nguyên tất cả ids
      setSelectedItems(ids);
      const labels = ids.map(id => findLabelById(options, id));
      onChange(ids, labels);
    } else {
      setSelectedItems(ids);

      const labels = findLabelById(options, ids);

      onChange(ids, labels);
    }
  };

  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  // Convert options để RichTreeView có thể handle
  const convertedOptions = React.useMemo(() => {
    const convertOptions = (opts: any[]): any[] => {
      return opts.map(item => ({
        ...item,
        label: convertLabelToString(item.label),
        children: item.children ? convertOptions(item.children) : undefined,
        // Store original JSX label for potential future use
        originalLabel: item.label
      }));
    };
    return convertOptions(options);
  }, [options]);

  return (
    <Box sx={{minHeight: 300, minWidth: 300}}>
      <RichTreeView
        items={convertedOptions}
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectedItemsChange}
        onExpandedItemsChange={handleExpandedItemsChange}
        expandedItems={expandedItems}
        checkboxSelection={checkboxSelection}
        multiSelect={multiSelect}
      />
    </Box>
  );
};
export {TTreeView};
