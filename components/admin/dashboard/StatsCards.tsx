import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  averageCGPA: number;
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
      {/* Total Students Card */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-600">Total Students</span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-semibold text-blue-900">{stats.totalStudents}</span>
              <span className="text-xs tracking-wide text-blue-600/80">Active enrollment</span>
            </div>
          </div>
          <div className="h-1 bg-blue-500 w-full"></div>
        </CardContent>
      </Card>

      {/* Placed Students Card */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-600">Placed Students</span>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shadow-md">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-semibold text-green-900">{stats.placedStudents}</span>
              <span className="text-xs tracking-wide text-green-600/80">
                {stats.totalStudents > 0 ? Math.round((stats.placedStudents / stats.totalStudents) * 100) : 0}% placement rate
              </span>
            </div>
          </div>
          <div className="h-1 bg-green-500 w-full"></div>
        </CardContent>
      </Card>

      {/* Unplaced Students Card */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-orange-600">Unplaced Students</span>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shadow-md">
                <UserX className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-semibold text-orange-900">{stats.unplacedStudents}</span>
              <span className="text-xs tracking-wide text-orange-600/80">Seeking opportunities</span>
            </div>
          </div>
          <div className="h-1 bg-orange-500 w-full"></div>
        </CardContent>
      </Card>

      {/* Average CGPA Card */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-600">Average CGPA</span>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shadow-md">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-semibold text-purple-900">{stats.averageCGPA.toFixed(2)}</span>
              <span className="text-xs tracking-wide text-purple-600/80">Across all students</span>
            </div>
          </div>
          <div className="h-1 bg-purple-500 w-full"></div>
        </CardContent>
      </Card>
    </div>
  );
}
