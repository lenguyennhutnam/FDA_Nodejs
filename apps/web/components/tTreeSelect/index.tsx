import {
  Box,
  ClickAwayListener,
  FormControl,
  Popover,
  TextField,
} from "@mui/material";
import {Grid} from "@mui/system";
import React, {useEffect, useRef, useState, useMemo} from "react";
import {TTreeView} from "../tTreeView";
import {TButton} from "../tButton";
import {toArray} from "../../utils/check";
import {TTextField} from "../tTextField";
const TTreeSelect = (props: any) => {
  const {
    options,
    value,
    onChange,
    label,
    multiSelect = false,
    checkboxSelection = false,
  } = props;
  const popoverRef = useRef<any>(null);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [expandedItems, setExpandedItems] = useState<any>([]);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [labelInput, setLabelInput] = useState<any>();

  useEffect(() => {
    if (openPopover && selectedItems.length > 0) {
      const newExpanded = new Set<any>([]);
      selectedItems.forEach((id: any) => {
        findParentIds(id, options).forEach((parentId: any) =>
          newExpanded.add(parentId)
        );
      });
      setExpandedItems([...newExpanded]);
    }
  }, [openPopover, selectedItems, options]);

  const findParentIds = (id: any, tree: any): any[] => {
    for (const node of tree) {
      if (node.id === id) return [];
      if (node.children) {
        for (const child of node.children) {
          if (child.id === id)
            return [node.id, ...findParentIds(node.id, tree)];
          const nested = findParentIds(id, node.children);
          if (nested.length) return [node.id, ...nested];
        }
      }
    }
    return [];
  };

  const findLabelById = (options: any, id: any): string => {
    for (const item of options) {
      if (item?.id === id) {
        return item.label;
      }
      if (toArray(item?.children)?.length > 0) {
        const found = findLabelById(item?.children, id);
        if (found) {
          return found;
        }
      }
    }
    return "";
  };

  useEffect(() => {
    // Xử lý value dựa trên multiSelect
    if (multiSelect) {
      // Multiple selection: value có thể là array hoặc single value
      const items = Array.isArray(value) ? value : value ? [value] : [];
      setSelectedItems(items);

      // Tạo label cho multiple selection
      const labels = items
        .map((id: any) => findLabelById(options, id))
        .filter(Boolean);
      setLabelInput(labels.join(", "));
    } else {
      // Single selection: value là single value
      const items = value ? [value] : [];
      setSelectedItems(items);

      const _labelInput = findLabelById(options, value);
      setLabelInput(_labelInput);
    }
  }, [value, multiSelect, options]);

  return (
    <Box sx={{width: "100%"}}>
      <TTextField
        sx={{width: "100%"}}
        value={labelInput}
        defaultValue={labelInput}
        onClick={() => {
          setOpenPopover(true);
        }}
        label={label}
        placeholder={multiSelect ? "Chọn nhiều đơn vị" : "Chọn đơn vị"}
        InputLabelProps={{shrink: true}}
      ></TTextField>
      <Popover
        open={openPopover}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
      >
        <ClickAwayListener
          onClickAway={event => {
            if (
              popoverRef.current &&
              popoverRef.current.contains(event.target)
            ) {
              return; // Không đóng nếu click vào popover
            }
            setOpenPopover(false);
          }}
        >
          <Box sx={{padding: "10px"}} ref={popoverRef}>
            <FormControl fullWidth>
              <TTreeView
                selectedItems={selectedItems}
                checkboxSelection={true}
                multiSelect={multiSelect}
                options={options}
                onChange={(values, labels) => {
                  console.log("values", values);
                  if (!multiSelect) {
                    console.log("values", values);
                    // Single selection behavior: chỉ lấy item cuối cùng được chọn

                    // Force update selectedItems để đảm bảo chỉ có 1 item được chọn
                    setSelectedItems([values]);

                    const labelText =
                      labels && labels.length > 0
                        ? labels[labels.length - 1]
                        : "";
                    setLabelInput(labelText);
                    onChange(values);
                  } else if (multiSelect) {
                    // Multiple selection: join labels với ", "
                    setSelectedItems(values);
                    const labelText = labels.filter(Boolean).join(", ");
                    setLabelInput(labelText);
                    onChange(values);
                  } else {
                    // Default single selection
                    const finalValue =
                      values && values.length > 0
                        ? values[values.length - 1]
                        : null;
                    const finalItems = finalValue ? [finalValue] : [];
                    setSelectedItems(finalItems);

                    const labelText =
                      labels && labels.length > 0
                        ? labels[labels.length - 1]
                        : "";
                    setLabelInput(labelText);
                    onChange(finalValue);
                  }
                }}
                expandedItems={expandedItems}
              ></TTreeView>
            </FormControl>

            <TButton
              sx={{width: "100%"}}
              variant="contained"
              onClick={() => {
                setOpenPopover(false);
              }}
            >
              Xác nhận
            </TButton>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
};
export {TTreeSelect};
