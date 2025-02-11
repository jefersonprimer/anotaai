export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  categoryId?: string;
  createdAt: string;
  starred?: boolean;
} 