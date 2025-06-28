/* eslint-disable @typescript-eslint/no-explicit-any */
//ts-ignore-file
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { ChatModal } from "./ChatModal";
import { usePathname } from "next/navigation";
// import ChatModal from "@/components/chat-modal" // <-- import your modal

interface Column<T> {
  key: keyof T | string;
  originalId?: keyof T | string;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isDeleting?: boolean;
}

export function DataTable<
  T extends {
    [x: string]: any;
    _id?: string;
  }
>({
  columns,
  data,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting = false,
}: DataTableProps<T>) {
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<T | null>(null);
  const pathname = usePathname();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleDeleteClick = (item: T) => {
    setDeleteItem(item);
    // console.log("first item", item)
  };

  const handleDeleteConfirm = async () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
      setDeleteItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteItem(null);
  };

  const getItemName = (item: T): string => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, any>;
      if (obj?.code) return `promo code "${obj.code}"`;
      return obj?.name || obj?.title || "item";
    }
    return "item";
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= 1) return [];

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-1"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="mx-2">
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="mx-1"
        >
          {totalPages}
        </Button>
      );
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-1"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table className="border border-[#707070]">
          <TableHeader>
            <TableRow className="border border-[#707070]">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className="font-semibold text-gray-900 text-left px-4 py-2"
                >
                  {column.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="font-semibold text-gray-900 text-center pl-2 py-2">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50 border border-[#707070]"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className="text-left px-4 py-5 whitespace-nowrap"
                      style={{ width: column.width || "auto" }}
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T])}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-center px-4 py-2">
                      <div className="flex justify-center items-center space-x-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            disabled={isDeleting}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(row)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {/* SMS / Chat Button */}
                        {/* Conditionally render: */}
                        {["/request-resource", "/resource-list"].includes(
                          pathname
                        ) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsChatOpen(true);
                              setSelectedResourceId(row.originalId);
                              console.log(
                                "Selected Resource ID:",
                                row.originalId
                              );
                            }}
                            className="text-[#424242] hover:text-green-600"
                            title="Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
          <div className="flex items-center space-x-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={!!deleteItem}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description={`Are you sure you want to delete ${
          deleteItem ? getItemName(deleteItem) : "this item"
        }? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        resourceId={selectedResourceId ? String(selectedResourceId) : ""}
      />
    </div>
  );
}

