"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useStudentStore from "@/lib/store/userStore";
import {
  MapPinIcon,
  BookOpenIcon,
  UserGroupIcon,
  PhoneIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setDarkMode(isDarkMode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkModeNow =
            document.documentElement.classList.contains("dark");
          setDarkMode(isDarkModeNow);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.role as string | undefined;

      if (userRole === "student") {
        router.push("/student/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin/");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066CC] dark:border-[#00508F]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        <section className="relative h-[550px] overflow-hidden transition-colors duration-200">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/college_ampi.jpeg"
              alt="IIIT Nagpur Campus"
              fill
              className="object-cover brightness-[0.85]"
              priority
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>

          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-shadow-sm">
                A one stop portal for Placements & Internships
              </h1>
              <p className="mb-8 text-lg md:text-xl font-light max-w-xl text-white/90 leading-relaxed">
                Welcome to the recruitment website for IIIT Nagpur. IIIT Nagpur
                is a premier institution dedicated to excellence in technology
                education. Our graduates combine rigorous thinking, hard work
                and fundamental stronghold.
              </p>
            </div>
          </div>

          <div className="absolute right-8 sm:right-12 md:right-16 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-4">
            <Button
              variant="default"
              className="w-44 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-lg rounded-xl flex items-center justify-start gap-3 px-5 py-6 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => router.push("/login?type=student")}
            >
              <span className="p-2 bg-white/20 rounded-full">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </span>
              <span className="font-medium text-base">Student</span>
            </Button>
            <Button
              variant="default"
              className="w-44 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-lg rounded-xl flex items-center justify-start gap-3 px-5 py-6 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => router.push("/login?type=admin")}
            >
              <span className="p-2 bg-white/20 rounded-full">
                <BriefcaseIcon className="h-5 w-5 text-white" />
              </span>
              <span className="font-medium text-base">Coordinator</span>
            </Button>
          </div>
        </section>

        <section id="academic-section" className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                  <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Academic Facilities</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Academics at IIIT Nagpur has the flexibility to evolve with ever
                changing requirements. Various activities are carried out to
                promote research, enhance creativity, learn new skills,
                implement innovative solutions and...
              </p>
              <Button
                variant="outline"
                className="text-[#0066CC] border-[#0066CC] hover:bg-[#0066CC]/10 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 transition-colors mt-2"
                onClick={() =>
                  window.open(
                    "https://iiitn.ac.in/page/facilities/19/",
                    "_blank"
                  )
                }
              >
                See more
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                  <BuildingLibraryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">
                  Departments & Programs
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                IIIT Nagpur is known as a premier engineering, science and
                technology institute in India. Currently, it offers an
                opportunity to learn in various departments and pursue multiple
                programs.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This university has strived and evolved over years to offer the
                students finest of its facilities for multi-dimensional growth.
              </p>
              <Button
                variant="default"
                className="bg-[#0066CC] hover:bg-[#0055AA] dark:bg-[#00508F] dark:hover:bg-[#004070] transition-colors mt-2"
                onClick={() =>
                  window.open("https://iiitn.ac.in/page/btech/34/", "_blank")
                }
              >
                Know more
              </Button>
            </div>
          </div>
        </section>

        {/* Why Recruit from IIITN Section */}
        <section
          id="about-section"
          className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-4">
                <BriefcaseIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                Why Recruit from IIITN?
              </h2>
              <div className="mt-4 h-1 w-20 bg-blue-600 dark:bg-blue-500 rounded"></div>
            </div>

            <div className="space-y-10">
              {/* Admission */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Admission
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Established by MHRD, Govt of Maharashtra, and Industry
                        partners.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Declared as Institution of National Importance by Act of
                        Parliament.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Admissions happen through JoSAA. Only top 2% candidates
                        taking JEE Mains Exam, make it to IIITN.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Industry Academia Collaboration */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Industry Academia Collaboration
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Tie up with Tata Consultancy Services Ltd as Industry
                        Partner.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        MoU with ESIEE (École Supérieure d'Ingénieurs en
                        Électrotechnique et Électronique) Paris- Graduate School
                        of Engineering, based in France for exchange programmes.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Curriculum */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Industry-Focused Curriculum
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Industry relevant dynamic curriculum designed by Board
                        of Studies which comprises of Tech experts from IT
                        industry.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Core subjects are incorporated from the 1st semester.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Choice Based Credit System gives an option to students
                        to choose subjects of their choice.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Option to pursue credit based Online Certification
                        Courses from Coursera, Udacity, Google Certifications.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Credit-based mandatory industry internship for full
                        semester in final year B.Tech.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Lecture series delivered by Tech experts from IT &
                        Electronics industry.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        IT Workshops on Data Structures, Python, HTML, Matlab,
                        Robotics, Machine Learning etc. are conducted regularly
                        by subject experts from IT industry.
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() =>
                        window.open(
                          "https://iiitn.ac.in/page/btech-cse-curriculum/37/",
                          "_blank"
                        )
                      }
                    >
                      CSE Curriculum
                    </Button>
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() =>
                        window.open(
                          "https://iiitn.ac.in/page/btech-ece-curriculum/38/",
                          "_blank"
                        )
                      }
                    >
                      ECE Curriculum
                    </Button>
                  </div>
                </div>
              </div>

              {/* Research Environment */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Research Environment
                    </h3>
                  </div>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Research work is focussed on problems faced by IT Industry.
                    Opportunity for people from Industry to pursue research
                    interests under Industry-Academia Collaboration.
                  </p>

                  <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                    Research Areas at IIIT Nagpur:
                  </h4>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Computer Science Engineering
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>Deep Learning</li>
                        <li>Machine Learning</li>
                        <li>Parallel Computing</li>
                        <li>High Performance Computing</li>
                        <li>Data Mining</li>
                        <li>IoT</li>
                        <li>Pattern recognition</li>
                        <li>Bio Informatics</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Electronics & Communication
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>Signal, Image and Video Processing</li>
                        <li>Biomedical Signal Processing</li>
                        <li>Antennas Design</li>
                        <li>Wireless Communication</li>
                        <li>Wireless Sensor Network</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Basic Sciences & Engineering
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>Applied/Engineering Physics</li>
                        <li>Materials Science</li>
                        <li>Nanoscience and Nanotechnology</li>
                        <li>Applied/Engineering Mathematics</li>
                        <li>Real Algebraic Geometry</li>
                        <li>Quadratic forms</li>
                        <li>Linear/nonlinear optimization</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() =>
                        window.open(
                          "https://iiitn.ac.in/page/research/71/",
                          "_blank"
                        )
                      }
                    >
                      Student Publications
                    </Button>
                  </div>
                </div>
              </div>

              {/* Clubs and Communities */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Clubs and Communities at IIITN
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                        Technical
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">Ack-Z</span> - A white
                            hat security club for ethical hackers
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">
                              United Gamers Community
                            </span>{" "}
                            - Provides a common platform for competitive gaming
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">DotSlash</span> -
                            Programming Community aims to foster the coding
                            culture
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <div>
                            <span className="font-medium">
                              Entities under DotSlash:
                            </span>
                            <ul className="ml-6 mt-1 space-y-1 text-sm">
                              <li>Open source Group</li>
                              <li>Competitive Programming Group</li>
                              <li>Machine Learning Group</li>
                            </ul>
                          </div>
                        </li>
                      </ul>

                      <h4 className="text-lg font-medium mb-3 mt-6 text-gray-900 dark:text-white">
                        Academics and Research
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">REAP</span> - This
                            Research Club helps students find their research
                            interests
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">The 7C Club</span> -
                            Communication and Public Speaking club
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                        Cultural
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">Music Club</span> -
                            Encourages the talented musicians and singers in the
                            Institute
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">Talartsdy</span> - The
                            Art club aims at nurturing creativity in students
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">Beats Spark</span> -
                            Dance Club, aims at bringing together dancers from
                            various dance forms
                          </span>
                        </li>
                      </ul>

                      <h4 className="text-lg font-medium mb-3 mt-6 text-gray-900 dark:text-white">
                        Flagship Annual Events @ IIITN
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">ABHIVYAKTI</span> –
                            The Annual Cultural Festival
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            <span className="font-medium">TANTRAFIESTA</span> –
                            National Level Technical Event by IIITN
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Director's Message Section */}
        <section
          id="director"
          className="py-16 bg-white dark:bg-gray-900 transition-colors"
        >
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Director Message
                  </h2>
                  <div className="mt-4 h-1 w-20 bg-blue-600 dark:bg-blue-500 rounded"></div>
                </div>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    A very warm greeting from Indian Institute of Information
                    Technology, Nagpur.
                  </p>

                  <p className="leading-relaxed">
                    Professor Prem Lal Patel, Director, VNIT, Nagpur took over
                    the additional charge as Director of IIIT, Nagpur on 1st
                    October, 2024. He is Professor (HAG) of Hydraulics and Water
                    Resources in Department of Civil Engineering, Sardar
                    Vallabhbhai National Institute of Technology (SVNIT), Surat.
                    He served as Deputy Director of the Institute (SVNIT) during
                    Sept 17, 2019 to Sept. 16, 2022.
                  </p>

                  <p className="leading-relaxed">
                    He worked as Dean (PG), Dean (R&C), Dean (Academic) and the
                    Head, Dept. of Civil Engineering at SVNIT Surat. Prior to
                    joining SVNIT in 2007, he served as Associate Professor,
                    Civil Engineering Department in Delhi College of Engineering
                    (now DTU) for eight years.
                  </p>

                  <p className="leading-relaxed">
                    Prior to working at DCE, he served as Assistant Executive
                    Engineer (Civil) in Border Roads Organization (BRO),
                    Ministry of Road Transport and Highways of India, Govt. of
                    India from 1995- 1999.
                  </p>

                  <Button
                    variant="link"
                    className="text-blue-600 dark:text-blue-400 pl-0 mt-2 hover:text-blue-800 dark:hover:text-blue-300"
                    onClick={() =>
                      window.open("https://iiitn.ac.in/", "_blank")
                    }
                  >
                    Read More...
                  </Button>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Director of IIITN</h2>
                  <div className="mt-4 h-1 w-20 bg-blue-600 dark:bg-blue-500 rounded"></div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-sm">
                    <div className="relative w-full pt-[100%]">
                      <Image 
                        src="/director.jpg" 
                        alt="Dr. Prem Lal Patel, Director of IIITN"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                        style={{ objectPosition: '50% 20%' }}
                        priority
                      />
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-xl font-medium text-blue-600 dark:text-blue-400">Dr. Prem Lal Patel</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Director, IIIT Nagpur</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-12 container mx-auto px-4">
          <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl overflow-hidden shadow-lg">
            <div className="md:flex">
              <div className="md:w-2/3 p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-4">
                  Contact Placement Cell
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p>
                      IIIT Nagpur, Survey No. 140,141/1 behind Br. Sheshrao
                      Wankhade Shetkari Sahkari Soot Girni, Village - Waranga,
                      PO - Dongargaon (Butibori), Nagpur – 441108
                    </p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p>+91 712 2985010</p>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p>placement@iiitn.ac.in</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/3 bg-blue-700 dark:bg-blue-800 p-8 md:p-10 flex items-center justify-center">
                <Button
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-md text-white px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() =>
                    window.open(
                      "https://iiitn.ac.in/Downloads/IIITN%20PLACEMENT%20BROCHURE%202020-211.pdf",
                      "_blank"
                    )
                  }
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2 inline-block" />
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-10">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  About IIITN
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  IIIT Nagpur is committed to academic excellence and innovative
                  research in the field of Information Technology.
                </p>
                <div className="flex space-x-4 mt-6">
                  <a
                    href="https://www.linkedin.com/school/iiitn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-[#0066CC] dark:bg-[#00508F] rounded-full flex items-center justify-center transition-colors hover:bg-blue-700 dark:hover:bg-blue-800"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/iiitn_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-[#0066CC] dark:bg-[#00508F] rounded-full flex items-center justify-center transition-colors hover:bg-blue-700 dark:hover:bg-blue-800"
                    aria-label="Twitter"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.053 10.053 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/iiitnagpur/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-[#0066CC] dark:bg-[#00508F] rounded-full flex items-center justify-center transition-colors hover:bg-blue-700 dark:hover:bg-blue-800"
                    aria-label="Facebook"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Quick Links
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link
                      href="https://iiitn.ac.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Institute Website
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#academic-section"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById("academic-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Academics
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://iiitn.ac.in/page/research/71/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://iiitn.ac.in/page/campus-life/104/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Student Life
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  For Companies
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link
                      href="#about-section"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById("about-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Why Recruit?
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://iiitn.ac.in/page/placement-statistics/45/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Past Recruiters
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#faqs"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById("faqs")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Contact
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <MapPinIcon className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span>Placement Cell, IIIT Nagpur</span>
                  </li>
                  <li className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>+91 712 2985010</span>
                  </li>
                  <li className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>+91 9404644199</span>
                  </li>
                    <li className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <a
                      href="mailto:placement@iiitn.ac.in?subject=Inquiry&body=Dear%20Placement%20Cell,"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      placement@iiitn.ac.in
                    </a>
                    </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} IIIT Nagpur Training & Placement
                Cell. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <Button
                  variant="link"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to top
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return null;
}
