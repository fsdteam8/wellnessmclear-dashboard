"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

interface Sender {
  _id: string;
  firstName: string;
  role: string;
}

interface Reply {
  message: string;
  sender: Sender;
  createdAt: string;
}

interface Question {
  _id: string;
  resource: string;
  question: string;
  askedBy: { _id: string; firstName: string; role: string };
  isAnswered: boolean;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Question[];
}

function Page() {
  const session = useSession();
  const TOKEN = session?.data?.accessToken
  const queryClient = useQueryClient();
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["question-ans"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qa`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch question and answers");
      }

      return res.json();
    },
    enabled: !!TOKEN,
  });

  const mutation = useMutation({
    mutationFn: async ({ questionId, reply }: { questionId: string; reply: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qa/reply/${questionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ answer: reply }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit reply");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-ans"] });
      setReplyInputs({});
    },
  });

  const handleReplySubmit = (questionId: string) => {
    const reply = replyInputs[questionId]?.trim();
    if (reply) {
      mutation.mutate({ questionId, reply });
    }
  };

  const handleReplyChange = (questionId: string, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (isError || !data?.status) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">
          Error fetching questions
        </div>
      </div>
    );
  }

  return (
    <div className=" p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Questions & Answers
      </h1>
      {data?.data?.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          No questions available.
        </p>
      ) : (
        <div className="space-y-8">
          {data?.data?.map((question) => (
            <div
              key={question._id}
              className=" rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {question.question}
              </h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Asked by {question.askedBy.firstName} on{" "}
                  {new Date(question.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    question.isAnswered
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {question.isAnswered ? "Answered" : "Unanswered"}
                </span>
              </div>
              {question.replies.length > 0 ? (
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Replies:
                  </h3>
                  <div className="space-y-4">
                    {question.replies.map((reply, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          reply.sender._id === session?.data?.user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            reply.sender._id === session?.data?.user?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{reply.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(reply.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            - {reply.sender.firstName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No replies yet.</p>
              )}
              <div className="mt-6 flex items-end space-x-2">
                <textarea
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 resize-y min-h-[50px]"
                  placeholder="Type your reply..."
                  value={replyInputs[question._id] || ""}
                  onChange={(e) => handleReplyChange(question._id, e.target.value)}
                  rows={1}
                />
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => handleReplySubmit(question._id)}
                  disabled={mutation.isPending || !replyInputs[question._id]?.trim()}
                >
                  {mutation.isPending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Page;