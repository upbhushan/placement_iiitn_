"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useStudentStore from "@/lib/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Pencil, Save, X, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  updateStudentProfile,
  StudentProfileData,
} from "@/components/cloudinary";

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login?callbackUrl=/student/profile");
    },
  });
  const { theme } = useTheme();
  const { student, setStudent } = useStudentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mounted, setMounted] = useState(false);

  // State for editable fields
  const [editableFields, setEditableFields] = useState({
    hometown: "",
    dob: new Date(),
    photo: "",
    "socialMedia.linkedin": "",
    "socialMedia.github": "",
    "socialMedia.twitter": "",
    "socialMedia.portfolio": "",
    "education.tenthMarks": 0 as number | null,
    "education.twelfthMarks": 0 as number | null,
  });

  // Ensure component is mounted to prevent hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: log student data
  useEffect(() => {
    console.log("Student data in profile page:", student);
  }, [student]);

  // Fetch student profile if not loaded
  useEffect(() => {
    const fetchStudent = async () => {
      if (!student && status === "authenticated") {
        try {
          const res = await axios.get("/api/student/profile");
          setStudent(res.data);
        } catch (err) {
          console.error("Failed to fetch student profile:", err);
        }
      }
    };
    fetchStudent();
  }, [student, status, setStudent]);

  // Initialize editable fields once student data is available
  useEffect(() => {
    if (student) {
      setEditableFields({
        hometown: student.hometown || "",
        dob: student.dob ? new Date(student.dob) : new Date(),
        photo: student.photo || "",
        "socialMedia.linkedin": student.socialMedia?.linkedin || "",
        "socialMedia.github": student.socialMedia?.github || "",
        "socialMedia.twitter": student.socialMedia?.twitter || "",
        "socialMedia.portfolio": student.socialMedia?.portfolio || "",
        "education.tenthMarks":
          student.education?.tenthMarks !== undefined &&
          student.education.tenthMarks !== null &&
          !isNaN(Number(student.education.tenthMarks))
            ? student.education.tenthMarks
            : 0,
        "education.twelfthMarks":
          student.education?.twelfthMarks !== undefined &&
          student.education.twelfthMarks !== null &&
          !isNaN(Number(student.education.twelfthMarks))
            ? student.education.twelfthMarks
            : 0,
      });

      // First show welcome animation, then reveal the profile
      setTimeout(() => {
        setPageLoading(false);
        // Hide welcome message after 2.5 seconds
        setTimeout(() => setShowWelcome(false), 2500);
      }, 800);
    }
  }, [student]);

  // Auth and student data check
  if (status === "loading" || pageLoading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background pb-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Show a message if student data is missing
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background pb-12">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg text-destructive">
            Student profile data not found. Please try reloading or contact support.
          </p>
        </div>
      </div>
    );
  }

  // Ensure the session user is authorized to view this profile
  if (session?.user?.role !== "student" && session?.user?.role !== "admin") {
    router.push("/unauthorized");
    return null;
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert to original values
      setEditableFields({
        hometown: student.hometown || "",
        dob: student.dob ? new Date(student.dob) : new Date(),
        photo: student.photo || "",
        "socialMedia.linkedin": student.socialMedia?.linkedin || "",
        "socialMedia.github": student.socialMedia?.github || "",
        "socialMedia.twitter": student.socialMedia?.twitter || "",
        "socialMedia.portfolio": student.socialMedia?.portfolio || "",
        "education.tenthMarks": student.education?.tenthMarks || 0,
        "education.twelfthMarks": student.education?.twelfthMarks || 0,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: string | number | Date) => {
    setEditableFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image less than 5MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setImageUploading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Implement your file upload logic here
      const response = await axios.post("/api/cloudinary", formData);
      console.log("Image upload response:", response.data.url);
      // Update photo URL
      const photoUrl = response.data.url;
      handleChange("photo", photoUrl);
      await axios.put("/api/student/profile", {
        photo: photoUrl,
      });
      setStudent({
        ...student,
        photo: photoUrl,
      });
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Format the data for the API
      const updateData = {
        hometown: editableFields.hometown,
        dob: editableFields.dob,
        photo: editableFields.photo,
        socialMedia: {
          linkedin: editableFields["socialMedia.linkedin"],
          github: editableFields["socialMedia.github"],
          twitter: editableFields["socialMedia.twitter"],
          portfolio: editableFields["socialMedia.portfolio"],
        },
        education: {
          tenthMarks: Number(editableFields["education.tenthMarks"]),
          twelfthMarks: Number(editableFields["education.twelfthMarks"]),
        },
      };

      // Call the API to update the profile
      const updatedStudent = await updateStudentProfile(updateData);

      // Update the student store with type casting to ensure gender compatibility
      setStudent({
        ...student,
        ...(updatedStudent as typeof student),
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Format functions for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(new Date(dateString), "PPP");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 90 },
    },
  };

  const headerAnimation = {
    hidden: { y: -20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.1,
      },
    },
  };

  const welcomeAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="min-h-screen bg-background pb-12"
    >
      {/* Welcome Animation */}
      {/* <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={welcomeAnimation}
          >
            <div className="text-center">
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-4"
              >
                <Avatar className="h-32 w-32 mx-auto border-4 border-background shadow-lg">
                  {student.photo ? (
                    <AvatarImage
                      src={student.photo}
                      alt={student.name || "Student"}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl font-medium">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-semibold tracking-tight text-foreground mb-2"
              >
                Welcome, {student.name?.split(" ")[0] || "Student"}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-xl text-muted-foreground"
              >
                Your profile is ready
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Hero Banner */}
      <motion.div
        variants={headerAnimation}
        className={cn(
          "w-full bg-gradient-to-b h-48 relative",
          theme === "dark"
            ? "from-background/40 to-background"
            : "from-gray-50 to-background"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="absolute -bottom-16 flex flex-col items-center w-full">
            {/* Profile Photo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              className="relative group"
            >
              <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                {student.photo ? (
                  <AvatarImage
                    src={student.photo}
                    alt={student.name || "Student"}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-medium">
                    {getInitials(student.name)}
                  </AvatarFallback>
                )}
              </Avatar>

              {isEditing && (
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  htmlFor="photo-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {imageUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                  <input
                    id="photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={imageUploading}
                  />
                </motion.label>
              )}
            </motion.div>

            {/* Name and Basic Info */}
            <motion.div variants={headerAnimation} className="mt-4 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {student.name}
              </h1>
              <p className="text-muted-foreground">{student.email}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerAnimation}
        className="container mx-auto px-4 mt-32"
      >
        {/* Action Buttons */}
        <motion.div
          variants={itemAnimation}
          className="flex justify-center mb-8"
        >
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? "destructive" : "secondary"}
            size="sm"
            className="rounded-full px-6 shadow-sm"
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleSave}
                variant="default"
                size="sm"
                className="ml-4 rounded-full px-6 shadow-sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </motion.div>
          )}
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Personal Details & Education */}
            <div className="space-y-8">
              <motion.div
                variants={itemAnimation}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border border-border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4 text-foreground">
                      Personal Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Name
                        </Label>
                        <p className="mt-1 text-foreground">
                          {student.name || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Gender
                        </Label>
                        <p className="mt-1 capitalize text-foreground">
                          {student.gender || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Date of Birth
                        </Label>
                        {isEditing ? (
                          <div className="mt-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editableFields.dob
                                    ? format(editableFields.dob, "PPP")
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={editableFields.dob}
                                  onSelect={(date) =>
                                    date && handleChange("dob", date)
                                  }
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1950-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        ) : (
                          <p className="mt-1 text-foreground">
                            {formatDate(student.dob)}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Hometown
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editableFields.hometown}
                            onChange={(e) =>
                              handleChange("hometown", e.target.value)
                            }
                            className="mt-1"
                            placeholder="Enter your hometown"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {student.hometown || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Phone Number
                        </Label>
                        <p className="mt-1 text-foreground">
                          {student.phoneNumber || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                variants={itemAnimation}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border border-border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4 text-foreground">
                      Education
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Branch
                        </Label>
                        <p className="mt-1 text-foreground">
                          {student.branch || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          10th Standard Marks
                        </Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={
                              editableFields["education.tenthMarks"] === null ||
                              Number.isNaN(
                                Number(editableFields["education.tenthMarks"])
                              )
                                ? ""
                                : editableFields["education.tenthMarks"]
                            }
                            onChange={(e) =>
                              handleChange(
                                "education.tenthMarks",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                            className="mt-1"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {student.education?.tenthMarks || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          12th Standard Marks
                        </Label>
                        {isEditing ? (
                          <Input
                            value={
                              editableFields["education.twelfthMarks"] ===
                                null ||
                              Number.isNaN(
                                Number(editableFields["education.twelfthMarks"])
                              )
                                ? ""
                                : editableFields["education.twelfthMarks"]
                            }
                            onChange={(e) =>
                              handleChange(
                                "education.twelfthMarks",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                            className="mt-1"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {student.education?.twelfthMarks || "Not specified"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          CGPA
                        </Label>
                        <p className="mt-1 text-foreground">
                          {student.cgpa || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Active Backlogs
                        </Label>
                        <p className="mt-1 text-foreground">
                          {student.activeBacklogs !== undefined
                            ? student.activeBacklogs
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Social & Placement */}
            <div className="space-y-8">
              <motion.div
                variants={itemAnimation}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border border-border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4 text-foreground">
                      Social Media
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="linkedin"
                          className="text-sm text-muted-foreground"
                        >
                          LinkedIn
                        </Label>
                        {isEditing ? (
                          <Input
                            id="linkedin"
                            value={editableFields["socialMedia.linkedin"]}
                            onChange={(e) =>
                              handleChange(
                                "socialMedia.linkedin",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="https://linkedin.com/in/username"
                          />
                        ) : (
                          <p className="mt-1">
                            {student.socialMedia?.linkedin ? (
                              <a
                                href={student.socialMedia.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {student.socialMedia.linkedin}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                Not specified
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="github"
                          className="text-sm text-muted-foreground"
                        >
                          GitHub
                        </Label>
                        {isEditing ? (
                          <Input
                            id="github"
                            value={editableFields["socialMedia.github"]}
                            onChange={(e) =>
                              handleChange("socialMedia.github", e.target.value)
                            }
                            className="mt-1"
                            placeholder="https://github.com/username"
                          />
                        ) : (
                          <p className="mt-1">
                            {student.socialMedia?.github ? (
                              <a
                                href={student.socialMedia.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {student.socialMedia.github}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                Not specified
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="twitter"
                          className="text-sm text-muted-foreground"
                        >
                          Twitter
                        </Label>
                        {isEditing ? (
                          <Input
                            id="twitter"
                            value={editableFields["socialMedia.twitter"]}
                            onChange={(e) =>
                              handleChange(
                                "socialMedia.twitter",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="https://twitter.com/username"
                          />
                        ) : (
                          <p className="mt-1">
                            {student.socialMedia?.twitter ? (
                              <a
                                href={student.socialMedia.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {student.socialMedia.twitter}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                Not specified
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="portfolio"
                          className="text-sm text-muted-foreground"
                        >
                          Portfolio Website
                        </Label>
                        {isEditing ? (
                          <Input
                            id="portfolio"
                            value={editableFields["socialMedia.portfolio"]}
                            onChange={(e) =>
                              handleChange(
                                "socialMedia.portfolio",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="https://yourportfolio.com"
                          />
                        ) : (
                          <p className="mt-1">
                            {student.socialMedia?.portfolio ? (
                              <a
                                href={student.socialMedia.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {student.socialMedia.portfolio}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                Not specified
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                variants={itemAnimation}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border border-border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4 text-foreground">
                      Placement Status
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Placement Status
                        </Label>
                        <p className="mt-1">
                          {student.placement?.placed ? (
                            <span className="text-green-600 dark:text-green-500 font-medium">
                              Placed
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-500 font-medium">
                              Not Placed Yet
                            </span>
                          )}
                        </p>
                      </div>

                      {student.placement?.placed && (
                        <>
                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Company
                            </Label>
                            <p className="mt-1 text-foreground">
                              {student.placement?.company || "Not specified"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Package
                            </Label>
                            <p className="mt-1 text-foreground">
                              {student.placement?.package
                                ? `₹ ${(
                                    student.placement.package / 100000
                                  ).toFixed(1)} LPA`
                                : "Not specified"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Type
                            </Label>
                            <p className="mt-1 capitalize text-foreground">
                              {student.placement?.type || "Not specified"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Offer Date
                            </Label>
                            <p className="mt-1 text-foreground">
                              {student.placement?.offerDate
                                ? formatDate(
                                    student.placement
                                      .offerDate as unknown as string
                                  )
                                : "Not specified"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;