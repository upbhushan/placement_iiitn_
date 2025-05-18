import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getCGPAColor } from "../shared/ColorUtils";
import { EditStudentModal } from "./EditStudentModal";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  placement: {
    placed: boolean;
    company?: string;
    package?: number;
    type?: 'intern' | 'fte' | 'both';
  };
  accountStatus: 'active' | 'inactive';
  photo?: string;
}

interface StudentTableProps {
  students: StudentData[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  onStudentUpdated?: () => void;
}

export function StudentTable({ students, totalCount, loading, error, onStudentUpdated }: StudentTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleRowClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setEditModalOpen(true);
  };

  const handleStudentUpdated = () => {
    if (onStudentUpdated) {
      onStudentUpdated();
    }
  };

  // Function to get placement type color
  const getPlacementTypeColor = (type?: string) => {
    switch (type) {
      case 'intern':
        return "bg-blue-50 text-blue-700 border-blue-100";
      case 'fte':
        return "bg-purple-50 text-purple-700 border-purple-100";
      case 'both':
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-green-50 text-green-700 border-green-100";
    }
  };

  // Format package amount based on type
  const formatPackage = (amount?: number, type?: string) => {
    if (!amount) return "—";

    if (type === 'intern') {
      return `₹${(amount / 1000).toFixed(1)}K/month`;
    } else {
      return `₹${(amount / 100000).toFixed(1)}L/annum`;
    }
  };

  if (loading) {
    return (
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="flex justify-center items-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-primary/80">Loading students...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="py-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="py-10">
          <div className="text-center text-gray-500">No students match your filters</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardHeader className="py-4 border-b border-gray-200/70">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900 text-lg font-medium">Student Records</CardTitle>
            <CardDescription>
              Showing {students.length} of {totalCount} students
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="text-gray-500 font-medium">Student</TableHead>
                <TableHead className="text-gray-500 font-medium">Branch</TableHead>
                <TableHead className="text-gray-500 font-medium">CGPA</TableHead>
                <TableHead className="text-gray-500 font-medium">Backlogs</TableHead>
                <TableHead className="text-gray-500 font-medium">Placement</TableHead>
                <TableHead className="text-gray-500 font-medium">Company</TableHead>
                <TableHead className="text-gray-500 font-medium">Package</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow
                  key={student._id}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(student._id)}
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <Avatar className="border border-gray-200/70">
                        <AvatarImage src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=fff&color=000`} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{student.branch}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{student.cgpa.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={
                      student.activeBacklogs > 0
                        ? "text-red-600 bg-red-50/80 rounded-full px-2 py-0.5 text-sm"
                        : "text-green-600 bg-green-50/80 rounded-full px-2 py-0.5 text-sm"
                    }>
                      {student.activeBacklogs}
                    </span>
                  </TableCell>
                  {/* Placement Status Column */}
                  <TableCell>
                    {student.placement.placed ? (
                      <span className={`text-sm px-2 py-0.5 rounded-full border ${getPlacementTypeColor(student.placement.type)}`}>
                        {student.placement.type === 'intern' ? 'Internship' :
                          student.placement.type === 'fte' ? 'Full-Time' :
                            student.placement.type === 'both' ? 'Intern + FTE' : 'Placed'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                        Not Placed
                      </span>
                    )}
                  </TableCell>
                  {/* Company Column */}
                  <TableCell>
                    <span className="text-sm text-gray-700">
                      {student.placement.placed ? student.placement.company || "—" : "—"}
                    </span>
                  </TableCell>
                  {/* Package/Stipend Column */}
                  <TableCell>
                    <span className={`text-sm ${student.placement.placed ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                      {student.placement.placed
                        ? formatPackage(student.placement.package, student.placement.type)
                        : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditStudentModal
        studentId={selectedStudentId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onStudentUpdated={handleStudentUpdated}
      />
    </>
  );
}