// Column type shared across different tables
export interface BaseColumn<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// Blog specific types
export interface Blog {
  _id: number;
  title: string;
  description: string;
  added: string;
  comments: number;
  thumbnail: string;
}

export type BlogColumn = BaseColumn<Blog>;

export interface BlogTableProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

// Subcategory specific types
export interface Subcategory {
  id: number;
  name: string;
  date: string;
}

export interface SubcategoryStats {
  totalCategories: number;
  totalSubcategories: number;
  activeCategories: number;
}

// User specific types
export interface User {
  id: number;
  userId: string;
  name: string;
  avatar: string;
  totalOrder: number;
  deliveredOrder: number;
  pendingOrder: number;
  cancelOrder: number;
}

export type UserColumn = BaseColumn<User>;

// Seller type
export interface Seller {
  name: string;
  avatar: string;
}

// Status type using union
export type ResourceStatus = "Approved" | "Pending" | "Reject";

// Resource Request type
export interface ResourceRequest {
  id: number;
  name: string;
  seller: Seller;
  price: string;
  discountPrice: string;
  quantity: number;
  format: string;
  date: string;
  thumbnail: string;
  statuses: ResourceStatus[];
}

// Column type for the Resource Request table
export type ResourceColumn = BaseColumn<ResourceRequest>;

// Props type for the Request Resource page component
export type RequestResourcePageProps = Record<string, never>;

// Product type
export interface Product {
  id: number;
  name: string;
  price: string;
  discountPrice: string;
  quantity: number;
  format: string;
  date: string;
  thumbnail: string;
}