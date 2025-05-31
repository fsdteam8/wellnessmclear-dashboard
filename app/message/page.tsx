"use client"

import { useState } from "react"
// import { Breadcrumb } from "@/components/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send } from "lucide-react"





const mockMessages = [
  {
    id: 1,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 2,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I Need help.",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 3,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 4,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 5,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 6,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 7,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
  {
    id: 8,
    user: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hi, I have a question...",
    time: "10:15 AM",
    resourceId: "1140",
    resourceName: "Resource Name Admissibility",
  },
]

export default function MessagePage() {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  return (
    <div className="flex h-screen">

      <div className="flex-1 overflow-hidden">
        <div className="p-6 pb-0">
          {/* <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Message" }]} /> */}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Message</h1>
            <p className="text-gray-500">Dashboard &gt; Message</p>
          </div>
        </div>

        <div className="flex h-[calc(100vh-200px)] mx-6 bg-white rounded-lg overflow-hidden">
          {/* Message List Sidebar */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Message......"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage.id === message.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.avatar || "/placeholder.svg"} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{message.resourceId}: Resource...</p>
                        <p className="text-xs text-gray-500">{message.time}</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{message.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMessage.avatar || "/placeholder.svg"} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedMessage.user}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.resourceId}: {selectedMessage.resourceName}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-slate-600 text-white px-4 py-2 rounded-lg max-w-xs">
                    <p className="text-sm">I Need help.</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-xs">
                    <p className="text-sm">What?</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 mt-4">09:41 AM</div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-slate-600 hover:bg-slate-700" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
