export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
}
