"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, ChevronDown, BotIcon } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  type: "user" | "bot";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "Hello! I'm your placement policy assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Format response text to be more readable
  const formatResponse = (text: string) => {
    // Convert numbered lists with patterns like "1.", "2.", etc. to proper formatting
    let formattedText = text.replace(/(\d+\.\s+)(.*?)(?=(\d+\.\s+|$))/g, '<div class="mb-2"><strong>$1</strong>$2</div>');
    
    // Convert "**Text**" to bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Add spacing between paragraphs
    formattedText = formattedText.replace(/\n\n/g, '<div class="my-2"></div>');
    
    // Replace single newlines with line breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "https://placement-plolicy-chatbot-api-3.onrender.com/ask",
        { question: userMessage }
      );
      
      // Format the response before adding it to messages
      const formattedAnswer = formatResponse(response.data.answer);
      
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: formattedAnswer },
      ]);
    } catch (error) {
      console.error("Error fetching response from chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        { 
          type: "bot", 
          content: "Sorry, I'm having trouble connecting right now. Please try again later." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={cn(
            "bg-white dark:bg-gray-900 rounded-xl shadow-2xl mb-4 w-96 sm:w-[450px] transition-all duration-300 ease-in-out flex flex-col border border-gray-200 dark:border-gray-700",
            isMinimized ? "h-14" : "h-[550px]"
          )}
        >
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-t-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <BotIcon className="h-6 w-6 text-white mr-3" />
              <h3 className="text-white font-medium text-lg">Placement Advisor</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMinimize}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <ChevronDown className={`h-5 w-5 transform ${isMinimized ? 'rotate-180' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Chat body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-5 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-xl max-w-[85%] shadow-sm",
                        message.type === "user" 
                          ? "bg-blue-500 text-white ml-auto" 
                          : "bg-white dark:bg-gray-800 mr-auto border border-gray-100 dark:border-gray-700"
                      )}
                    >
                      <p 
                        className="leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                      <div className="text-xs mt-2 opacity-70 text-right">
                        {message.type === "user" ? "You" : "Assistant"}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl max-w-[85%] mr-auto shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex space-x-2 items-center">
                        <div className="h-2.5 w-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="h-2.5 w-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2.5 w-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Chat input */}
              <div className="border-t p-4 bg-white dark:bg-gray-900 rounded-b-xl">
                <div className="flex space-x-3">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about placement policies..."
                    className="resize-none min-h-[50px] max-h-32 flex-1 border-gray-200 dark:border-gray-700 rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-0 flex items-center justify-center transition-transform duration-300 hover:scale-105"
      >
        <MessageSquare className="h-7 w-7" />
        {!isOpen && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">1</span>
        )}
      </Button>
    </div>
  );
}