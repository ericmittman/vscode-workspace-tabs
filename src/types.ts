export interface WorkspaceEntry {
  /** Display name — filename without the `.code-workspace` extension */
  name: string;
  /** Absolute path to the `.code-workspace` file */
  path: string;
  /** Hex color string, e.g. `#4ec9b0` */
  color: string;
}
