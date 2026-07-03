import React from "react";
import { useAppSelector } from "../../hooks";
import { checkPermisison } from "../../utils";
import { SystemAction, SystemFeatures } from "../../types";

interface TPermissionComponentProps {
  module?: SystemFeatures;
  actions?: SystemAction[];
  children: React.ReactNode;
}

export const TPermissionComponent: React.FC<TPermissionComponentProps> = ({
  module = null,
  actions = [],
  children,
}) => {
  const { permission } = useAppSelector((state) => state.auth);

  let canVisible = true;
  if (module && actions.length > 0)
    canVisible = checkPermisison(permission, module, actions);

  if (canVisible === false) return null;

  return <>{children}</>;
};
