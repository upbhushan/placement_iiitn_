"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../shared/ColorUtils";
import { studentInterface } from "@/lib/db/models/student";
import {
  User,
  GraduationCap,
  Building,
  CreditCard,
  BadgeCheck,
  Home,
  Phone,
  Mail,
  Calendar,
  Users,
  Briefcase,
  Globe
} from "lucide-react";

interface EditStudentModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
}

export function EditStudentModal({ studentId, isOpen, onClose, onStudentUpdated }: EditStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Partial<studentInterface> | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    }
  }, [isOpen, studentId]);

  async function fetchStudentData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${studentId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStudent(result.data);
      } else {
        toast.error(result.message || "Failed to fetch student data");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === "placement.placed") {
      setStudent(prev => prev ? {
        ...prev,
        placement: {
          ...prev.placement as any,
          placed: checked
        }
      } : null);
    } else {
      setStudent(prev => prev ? { ...prev, [name]: checked } : null);
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    if (parent === "placement") {
      setStudent(prev => prev ? {
        ...prev,
        placement: {
          ...prev.placement as any,
          [field]: value
        }
      } : null);
    } else if (parent === "education") {
      setStudent(prev => prev ? {
        ...prev,
        education: {
          ...prev.education as any,
          [field]: value
        }
      } : null);
    } else if (parent === "socialMedia") {
      setStudent(prev => prev ? {
        ...prev,
        socialMedia: {
          ...prev.socialMedia as any,
          [field]: value
        }
      } : null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Student updated successfully");
        onStudentUpdated();
        onClose();
      } else {
        toast.error(result.message || "Failed to update student");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!student && !loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/70 dark:border-zinc-800 shadow-xl">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-zinc-800">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-4 text-gray-900 dark:text-white">
            {!loading && student && (
              <Avatar className="h-12 w-12 border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <AvatarImage src={student.photo} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                  {getInitials(student.name || "")}
                </AvatarFallback>
              </Avatar>
            )}
            Edit Student Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Update student information in the system
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
        ) : student ? (
          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <User size={18} />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={student.name || ""}
                    onChange={handleInputChange}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      value={student.email || ""}
                      onChange={handleInputChange}
                      className="rounded-lg pl-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={student.phoneNumber || ""}
                      onChange={handleInputChange}
                      className="rounded-lg pl-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                  <Select
                    value={student.gender || ""}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hometown" className="text-gray-700 dark:text-gray-300">Hometown</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="hometown"
                      name="hometown"
                      value={student.hometown || ""}
                      onChange={handleInputChange}
                      className="rounded-lg pl-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ""}
                      onChange={handleInputChange}
                      className="rounded-lg pl-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Academic Information */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <GraduationCap size={18} />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-gray-700 dark:text-gray-300">Branch</Label>
                  <Select
                    value={student.branch || ""}
                    onValueChange={(value) => handleSelectChange("branch", value)}
                  >
                    <SelectTrigger className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
                      <SelectItem value="CSE">CSE (Computer Science)</SelectItem>
                      <SelectItem value="ECE">ECE (Electronics)</SelectItem>
                      <SelectItem value="DSA">DSA (Data Science)</SelectItem>
                      <SelectItem value="AIML">AIML (AI & Machine Learning)</SelectItem>
                      <SelectItem value="HCIG">HCIG (Human Computer Interaction)</SelectItem>
                      <SelectItem value="IOT">IOT (Internet of Things)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgpa" className="text-gray-700 dark:text-gray-300">CGPA</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="cgpa"
                      name="cgpa"
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={student.cgpa || ""}
                      onChange={handleInputChange}
                      className="rounded-lg pl-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activeBacklogs" className="text-gray-700 dark:text-gray-300">Active Backlogs</Label>
                  <Input
                    id="activeBacklogs"
                    name="activeBacklogs"
                    type="number"
                    min="0"
                    value={student.activeBacklogs || 0}
                    onChange={handleInputChange}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenthMarks" className="text-gray-700 dark:text-gray-300">10th Marks (%)</Label>
                  <Input
                    id="tenthMarks"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={student.education?.tenthMarks || ""}
                    onChange={(e) => handleNestedInputChange("education", "tenthMarks", parseFloat(e.target.value))}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twelfthMarks" className="text-gray-700 dark:text-gray-300">12th Marks (%)</Label>
                  <Input
                    id="twelfthMarks"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={student.education?.twelfthMarks || ""}
                    onChange={(e) => handleNestedInputChange("education", "twelfthMarks", parseFloat(e.target.value))}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Placement Information */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <Briefcase size={18} />
                Placement Information
              </h3>
              <div className="space-y-5">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                  <Switch
                    id="placed"
                    checked={student.placement?.placed || false}
                    onCheckedChange={(checked) => handleSwitchChange("placement.placed", checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="placed" className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                    {student.placement?.placed ? "Student is placed" : "Student is not placed"}
                  </Label>
                </div>

                {student.placement?.placed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="company"
                          value={student.placement?.company || ""}
                          onChange={(e) => handleNestedInputChange("placement", "company", e.target.value)}
                          className="rounded-lg pl-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package" className="text-gray-700 dark:text-gray-300">Package (₹)</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="package"
                          type="number"
                          min="0"
                          value={student.placement?.package || ""}
                          onChange={(e) => handleNestedInputChange("placement", "package", parseFloat(e.target.value))}
                          className="rounded-lg pl-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placementType" className="text-gray-700 dark:text-gray-300">Placement Type</Label>
                      <Select
                        value={student.placement?.type || ""}
                        onValueChange={(value) => handleNestedInputChange("placement", "type", value)}
                      >
                        <SelectTrigger className="rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
                          <SelectItem value="intern">Internship</SelectItem>
                          <SelectItem value="fte">Full-Time</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerDate" className="text-gray-700 dark:text-gray-300">Offer Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          id="offerDate"
                          type="date"
                          value={student.placement?.offerDate ? new Date(student.placement.offerDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleNestedInputChange("placement", "offerDate", e.target.value)}
                          className="rounded-lg pl-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Account Status */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <BadgeCheck size={18} />
                Account Status
              </h3>
              <div className="space-y-2">
                <Label htmlFor="accountStatus" className="text-gray-700 dark:text-gray-300">Status</Label>
                <Select
                  value={student.accountStatus || "active"}
                  onValueChange={(value) => handleSelectChange("accountStatus", value)}
                >
                  <SelectTrigger className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                        Inactive
                      </div>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        Blocked
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <Globe size={18} />
                Social Media
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-gray-700 dark:text-gray-300">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={student.socialMedia?.linkedin || ""}
                    onChange={(e) => handleNestedInputChange("socialMedia", "linkedin", e.target.value)}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-gray-700 dark:text-gray-300">GitHub</Label>
                  <Input
                    id="github"
                    value={student.socialMedia?.github || ""}
                    onChange={(e) => handleNestedInputChange("socialMedia", "github", e.target.value)}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio" className="text-gray-700 dark:text-gray-300">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={student.socialMedia?.portfolio || ""}
                    onChange={(e) => handleNestedInputChange("socialMedia", "portfolio", e.target.value)}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md min-w-[100px]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}