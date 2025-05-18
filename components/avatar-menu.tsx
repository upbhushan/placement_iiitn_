"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import useStudentStore from '@/lib/store/userStore'; 
import { redirect } from "next/navigation";


interface AvatarMenuProps {
  userName?: string;
  userEmail?: string;
  userImage?: string;
}

export function AvatarMenu() {
  const { student } = useStudentStore();
  
  const userName = student?.name || "";
  const userEmail = student?.email || "";
  const userImage = student?.photo || "";
  const initials = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none group">
          <Avatar className="h-8 w-8 transition border-none shadow-sm group-hover:opacity-90">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 apple-glass p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <div className="flex items-center justify-start gap-2 p-4 bg-white/90 dark:bg-gray-900/90">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium apple-text">{userName}</p>
            <p className="text-xs text-gray-500 apple-text dark:text-gray-400">{userEmail}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-black">
          <DropdownMenuItem asChild className="py-2.5 focus:bg-gray-100 dark:focus:bg-gray-800">
            <Link href="/student/profile" className="cursor-pointer flex w-full items-center px-4">
              <User className="mr-2.5 h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
              <span className="text-sm apple-text">Edit Profile</span>
              
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer py-2.5 focus:bg-gray-100 dark:focus:bg-gray-800 px-4"
            onClick={() => {
              signOut({ callbackUrl: '/' });
              redirect('/login'); 
            }}
          >
            <LogOut className="mr-2.5 h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
            <span className="text-sm apple-text">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}