/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
// import { BaseColumn } from "@/type/types"

interface DataTableProps<T> {
  // columns: BaseColumn<T>[] || string[]
  columns: any[]
  data: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

export function DataTable<T>({
  columns,
  data,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Add state for delete confirmation
  const [deleteItem, setDeleteItem] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  console.log(isDeleting);
  // Update the delete button click handler
  const handleDeleteClick = (item: T) => {
    setDeleteItem(item)
  }

  const handleDeleteConfirm = async () => {
    if (deleteItem && onDelete) {
      setIsDeleting(true)
      try {
        await onDelete(deleteItem)
        setDeleteItem(null)
      } catch {
        // Error handling is done in the parent component
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteItem(null)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5

    // Previous button
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
      </Button>,
    )

    // Page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
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
        </Button>,
      )
    }

    // Show ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="mx-2">
            ...
          </span>,
        )
      }
      buttons.push(
        <Button key={totalPages} variant="outline" size="sm" onClick={() => onPageChange(totalPages)} className="mx-1">
          {totalPages}
        </Button>,
      )
    }

    // Next button
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
      </Button>,
    )

    return buttons
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold text-gray-900">
                  {column.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="font-semibold text-gray-900">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render((row as any)[column.key], row) : String((row as any)[column.key])}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(row)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deleteItem}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  )
}
