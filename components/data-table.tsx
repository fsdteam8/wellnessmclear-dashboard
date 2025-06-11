// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import type React from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
// import { useState } from "react";
// import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
// // import { BaseColumn } from "@/type/types"

// interface DataTableProps<T> {
//   // columns: BaseColumn<T>[] || string[]
//   columns: any[];
//   data: T[];
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
//   onPageChange: (page: number) => void;
//   onEdit?: (item: T) => void;
//   onDelete?: (item: T) => void;
// }

// export function DataTable<T>({
//   columns,
//   data,
//   currentPage,
//   totalPages,
//   totalItems,
//   itemsPerPage,
//   onPageChange,
//   onEdit,
//   onDelete,
// }: DataTableProps<T>) {
//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, totalItems);

//   // Add state for delete confirmation
//   const [deleteItem, setDeleteItem] = useState<T | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   console.log(isDeleting);
//   // Update the delete button click handler
//   const handleDeleteClick = (item: T) => {
//     setDeleteItem(item);
//   };

//   const handleDeleteConfirm = async () => {
//     if (deleteItem && onDelete) {
//       setIsDeleting(true);
//       try {
//         await onDelete(deleteItem);
//         setDeleteItem(null);
//       } catch {
//         // Error handling is done in the parent component
//       } finally {
//         setIsDeleting(false);
//       }
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteItem(null);
//   };

//   const renderPaginationButtons = () => {
//     const buttons = [];
//     const maxVisiblePages = 5;

//     // Previous button
//     buttons.push(
//       <Button
//         key="prev"
//         variant="outline"
//         size="sm"
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="mr-1"
//       >
//         <ChevronLeft className="h-4 w-4" />
//       </Button>
//     );

//     // Page numbers
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       buttons.push(
//         <Button
//           key={i}
//           variant={i === currentPage ? "default" : "outline"}
//           size="sm"
//           onClick={() => onPageChange(i)}
//           className="mx-1"
//         >
//           {i}
//         </Button>
//       );
//     }

//     // Show ellipsis and last page if needed
//     if (endPage < totalPages) {
//       if (endPage < totalPages - 1) {
//         buttons.push(
//           <span key="ellipsis" className="mx-2">
//             ...
//           </span>
//         );
//       }
//       buttons.push(
//         <Button
//           key={totalPages}
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(totalPages)}
//           className="mx-1"
//         >
//           {totalPages}
//         </Button>
//       );
//     }

//     // Next button
//     buttons.push(
//       <Button
//         key="next"
//         variant="outline"
//         size="sm"
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="ml-1"
//       >
//         <ChevronRight className="h-4 w-4" />
//       </Button>
//     );

//     return buttons;
//   };

//   return (
//     <div className="space-y-4">
//       <div className="rounded-lg border">
//         <Table className="border border-[#707070]">
//           <TableHeader>
//             <TableRow className="border border-[#707070]">
//               {columns.map((column) => (
//                 <TableHead
//                   key={column.key}
//                   className="font-semibold text-gray-900 text-left px-4 py-2"
//                 >
//                   {column.label}
//                 </TableHead>
//               ))}
//               {(onEdit || onDelete) && (
//                 <TableHead className="font-semibold text-gray-900 text-center pl-2 py-2">
//                   Action
//                 </TableHead>
//               )}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {data.map((row, index) => (
//               <TableRow
//                 key={index}
//                 className="hover:bg-gray-50 border border-[#707070]"
//               >
//                 {columns.map((column) => (
//                   <TableCell
//                     key={column.key}
//                     className="text-left px-4 py-5 whitespace-nowrap"
//                     style={{ width: column.width || "auto" }}
//                   >
//                     {column.render
//                       ? column.render((row as any)[column.key], row)
//                       : String((row as any)[column.key])}
//                   </TableCell>
//                 ))}

//                 {(onEdit || onDelete) && (
//                   <TableCell className="text-center px-4 py-2">
//                     <div className="flex justify-center items-center space-x-2">
//                       {onEdit && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => onEdit(row)}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                       )}
//                       {onDelete && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleDeleteClick(row)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination UI */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-700">
//           Showing <span className="font-medium">{startItem}</span> to{" "}
//           <span className="font-medium">{endItem}</span> of{" "}
//           <span className="font-medium">{totalItems}</span> results
//         </p>
//         <div className="flex items-center space-x-2">
//           {renderPaginationButtons()}
//         </div>
//       </div>

//       {/* Delete Confirmation Dialog */}
//       <DeleteConfirmationDialog
//         isOpen={!!deleteItem}
//         onClose={handleDeleteCancel}
//         onConfirm={handleDeleteConfirm}
//         title="Delete Item"
//         description="Are you sure you want to delete this item? This action cannot be undone."
//       />
//     </div>
//   );
// }






/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface DataTableProps<T> {
  columns: any[]
  data: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  queryKey?: string[]
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
  queryKey = ["blog"],
}: DataTableProps<T>) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Add state for delete confirmation
  const [deleteItem, setDeleteItem] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Set up query client for cache invalidation
  const queryClient = useQueryClient()
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODE0NGFiODkzNjg4NGU0OTY0MzhiNjQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDkwMzY1NzQsImV4cCI6MTc0OTY0MTM3NH0.XyD7AImvYdvYPTkVMQr5WpGR1sDs4HjibnwKcBOSjQA";

  // Set up delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: async (item: T) => {
      const itemId = (item as any)._id || (item as any).id
      const response = await fetch(`http://localhost:5000/api/v1/blog/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete item")
      }

      return itemId
    },
    onSuccess: () => {
      // Invalidate and refetch the data after successful deletion
      queryClient.invalidateQueries({ queryKey })
      setDeleteItem(null)
      setIsDeleting(false)
    },
    onError: () => {
      console.error("Delete failed:")
      setIsDeleting(false)
    },
  })

  // Handle delete button click - show confirmation dialog
  const handleDeleteClick = (item: T) => {
    setDeleteItem(item)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (deleteItem) {
      setIsDeleting(true)
      try {
        await deleteMutation.mutateAsync(deleteItem)
        // Call onDelete callback if it exists
        if (onDelete) {
          onDelete(deleteItem)
        }
      } catch (error) {
        console.error("Delete operation failed:", error)
      }
    }
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteItem(null)
    setIsDeleting(false)
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
      <div className="rounded-lg border">
        <Table className="border border-[#707070]">
          <TableHeader>
            <TableRow className="border border-[#707070]">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold text-gray-900 text-left px-4 py-2">
                  {column.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="font-semibold text-gray-900 text-center pl-2 py-2">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50 border border-[#707070]">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="text-left px-4 py-5 whitespace-nowrap"
                    style={{ width: column.width || "auto" }}
                  >
                    {column.render ? column.render((row as any)[column.key], row) : String((row as any)[column.key])}
                  </TableCell>
                ))}

                {(onEdit || onDelete) && (
                  <TableCell className="text-center px-4 py-2">
                    <div className="flex justify-center items-center space-x-2">
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row)} disabled={isDeleting}>
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
                        >
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
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </p>
        <div className="flex items-center space-x-2">{renderPaginationButtons()}</div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deleteItem}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  )
}
