export interface Note {
  id: string;
  title: string;
  content: string;
  starred?: boolean;
  createdAt: Date;
  categoryId?: string;
}