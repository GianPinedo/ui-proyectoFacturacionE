export interface ModulePageRow {
  [key: string]: string;
}

export interface ModulePageConfig {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  columns: { key: string; label: string }[];
  rows: ModulePageRow[];
}
