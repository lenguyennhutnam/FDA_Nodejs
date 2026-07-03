declare module "@phuocng/react-pdf-viewer" {
  import * as React from "react";

  export interface WorkerProps {
    workerUrl: string;
    children?: React.ReactNode; // 👈 Fix ở đây
  }
  export interface ViewerProps {
    fileUrl: string;
    [key: string]: any;
  }
  export const Viewer: React.FC<ViewerProps>;
  export class Worker extends React.Component<WorkerProps> {}
}
