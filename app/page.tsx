
"use client";

import { Button } from "@/components/ui/button";
import {connectToDatabase} from "@/lib/db/mongodb";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useStudentStore from "@/lib/store/userStore";
import { mapToStudentData } from "@/lib/store/userStore";



export default function Home(){


  return (
    <>
    <div className="text-5xl font-extrabold text-blue-500 text-shadow-amber-600">
      Hello</div>
      <Button variant={"outline"} size={"lg"} >Click me!</Button></>
  )
}