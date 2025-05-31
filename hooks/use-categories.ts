"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: number
  name: string
  description: string
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: number
  name: string
  description: string
  categoryId: number
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Mock data
      const mockData: Category[] = [
        { id: 1, name: "Entertainment", description: "Entertainment category" },
        { id: 2, name: "Health", description: "Health category" },
        { id: 3, name: "Sports", description: "Sports category" },
      ]
      setCategories(mockData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (data: Omit<Category, "id">) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newCategory: Category = {
        id: Date.now(),
        ...data,
      }
      setCategories((prev) => [...prev, newCategory])
      toast({
        title: "Success",
        description: "Category created successfully",
      })
      return newCategory
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateCategory = async (id: number, data: Partial<Category>) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)))
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}
