
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface Sender {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "ADMIN" | "SELLER"
}

interface Message {
  message: string
  sender: Sender
  read: boolean
  _id: string
  createdAt: string
}

interface Conversation {
  _id: string
  resource: {
    _id: string
    title: string
  }
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  status: boolean
  message: string
  data: Conversation[]
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  resourceId?: string
}

export function ChatModal({ isOpen, onClose, resourceId }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const session = useSession()
//   const token = (session?.data?.user as { accessToken: string })?.accessToken
    const token = session?.data?.accessToken || "";

// console.log("ChatModal - Token:", token)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
/* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && resourceId) {
      fetchMessages()
    }
  }, [isOpen, resourceId])

  const fetchMessages = async () => {
    if (!resourceId) return
    setIsLoading(true)
    setMessages([])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/message/conversations/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch conversations")

      const data: ApiResponse = await response.json()
      const conversation = data.data.find((conv) => conv.resource._id === resourceId)

      if (conversation) {
        const uniqueMessages = Array.from(new Map(conversation.messages.map((m) => [m._id, m])).values())
        const sorted = uniqueMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        setMessages(sorted)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !resourceId) return
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resourceId,
          message: newMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setNewMessage("")
      await fetchMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="text-sm font-semibold">Chat - Resource ID: {resourceId}</div>
          <div className="text-center text-sm text-muted-foreground">{formatTime(new Date())}</div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages found.</div>
          ) : (
            messages.map((message) => {
              const isAdmin = message.sender.role === "ADMIN"

              return (
                <div key={message._id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                  <div className="max-w-[80%] space-y-1">
                    {!isAdmin && (
                      <div className="text-xs text-muted-foreground px-2">
                        {message.sender.firstName} {message.sender.lastName}
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm",
                        isAdmin ? "bg-slate-600 text-white" : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {message.message}
                    </div>
                    <div
                      className={cn("text-xs text-muted-foreground px-2", isAdmin ? "text-right" : "text-left")}
                    >
                      {formatTime(new Date(message.createdAt))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type your message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 rounded-full border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
              className="rounded-full bg-slate-600 hover:bg-slate-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
