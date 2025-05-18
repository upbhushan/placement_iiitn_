"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

// Import our components
import { Navbar } from '@/components/admin/dashboard/Navbar';
import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { FilterTags } from '@/components/admin/dashboard/FilterTags';
import { FilterControls } from '@/components/admin/dashboard/FilterControls';
import { StudentTable } from '@/components/admin/dashboard/StudentTable';

// Types for our data
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

// Dashboard statistics type
interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  averageCGPA: number;
}

// Filter tag type
interface FilterTag {
  id: string;
  type: string;
  value: string | number;
  label: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    averageCGPA: 0
  });
  
  // Filtering and sorting states
  const [placementFilter, setPlacementFilter] = useState<'all' | 'placed' | 'unplaced'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [cgpaFilter, setCgpaFilter] = useState<number | null>(null);
  const [salaryFilter, setSalaryFilter] = useState<number | null>(null);
  const [internFilter, setInternFilter] = useState<'all' | 'intern' | 'fte' | 'both' | 'none' | 'noplacement'>('all');
  const [salaryPercentFilter, setSalaryPercentFilter] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'name' | 'cgpa' | 'branch' | 'salary'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter tags
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);
  
  // Get unique branches for filter dropdown
  const branches = Array.from(new Set(students.map(s => s.branch)));
  
  // Get min and max CGPA
  const minCGPA = students.length > 0 ? Math.min(...students.map(s => s.cgpa)) : 0;
  const maxCGPA = students.length > 0 ? Math.max(...students.map(s => s.cgpa)) : 10;
  
  // Get min and max salary from placed students
  const placedStudentsWithPackage = students.filter(s => s.placement.placed && s.placement.package);
  const minSalary = placedStudentsWithPackage.length > 0 
    ? Math.min(...placedStudentsWithPackage.map(s => s.placement.package || 0)) / 100000 
    : 0;
  const maxSalary = placedStudentsWithPackage.length > 0 
    ? Math.max(...placedStudentsWithPackage.map(s => s.placement.package || 0)) / 100000 
    : 50;
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStudents();
    }
  }, [status]);
  
  useEffect(() => {
    if (students.length > 0) {
      // Calculate dashboard stats
      const totalStudents = students.length;
      const placedStudents = students.filter(s => s.placement.placed).length;
      const unplacedStudents = totalStudents - placedStudents;
      const averageCGPA = students.reduce((sum, student) => sum + student.cgpa, 0) / totalStudents;
      
      setStats({
        totalStudents,
        placedStudents,
        unplacedStudents,
        averageCGPA
      });
      
      // Apply initial filtering and sorting
      applyFiltersAndSort();
    }
  }, [students]);
  
  // Apply filtering and sorting when any filter/sort parameter changes
  useEffect(() => {
    applyFiltersAndSort();
    updateFilterTags();
  }, [
    placementFilter, 
    branchFilter, 
    cgpaFilter, 
    salaryFilter, 
    internFilter, 
    salaryPercentFilter,
    sortField, 
    sortDirection, 
    searchTerm, 
    activeTab
  ]);
  
  // Update filter tags based on active filters
  function updateFilterTags() {
    const newTags: FilterTag[] = [];
    
    if (branchFilter !== 'all') {
      newTags.push({
        id: 'branch',
        type: 'branch',
        value: branchFilter,
        label: `Branch: ${branchFilter}`
      });
    }
    
    if (cgpaFilter !== null) {
      newTags.push({
        id: 'cgpa',
        type: 'cgpa',
        value: cgpaFilter,
        label: `CGPA: ≥ ${cgpaFilter}`
      });
    }
    
    if (salaryFilter !== null) {
      newTags.push({
        id: 'salary',
        type: 'salary',
        value: salaryFilter,
        label: `Salary: ≥ ${salaryFilter}L`
      });
    }
    
    if (internFilter !== 'all') {
      newTags.push({
        id: 'internType',
        type: 'internType',
        value: internFilter,
        label: `Type: ${internFilter.toUpperCase()}`
      });
    }
    
    if (salaryPercentFilter !== null) {
      newTags.push({
        id: 'salaryPercent',
        type: 'salaryPercent',
        value: salaryPercentFilter,
        label: `Salary %: ${salaryPercentFilter}%`
      });
    }
    
    if (placementFilter !== 'all') {
      newTags.push({
        id: 'placement',
        type: 'placement',
        value: placementFilter,
        label: `Status: ${placementFilter === 'placed' ? 'Placed' : 'Unplaced'}`
      });
    }
    
    setFilterTags(newTags);
  }
  
  // Remove filter tag
  function removeFilterTag(id: string) {
    switch(id) {
      case 'branch':
        setBranchFilter('all');
        break;
      case 'cgpa':
        setCgpaFilter(null);
        break;
      case 'salary':
        setSalaryFilter(null);
        break;
      case 'internType':
        setInternFilter('all');
        break;
      case 'salaryPercent':
        setSalaryPercentFilter(null);
        break;
      case 'placement':
        setPlacementFilter('all');
        break;
      default:
        break;
    }
  }
  
  function clearAllFilters() {
    setPlacementFilter('all');
    setBranchFilter('all');
    setCgpaFilter(null);
    setSalaryFilter(null);
    setInternFilter('all');
    setSalaryPercentFilter(null);
  }
  
  async function fetchStudents() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data);
        setFilteredStudents(result.data);
      } else {
        setError(result.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  function applyFiltersAndSort() {
    let filtered = [...students];
    
    // Apply tab filter
    if (activeTab === 'placed') {
      filtered = filtered.filter(s => s.placement.placed);
    } else if (activeTab === 'unplaced') {
      filtered = filtered.filter(s => !s.placement.placed);
    } else if (activeTab === 'active') {
      filtered = filtered.filter(s => s.accountStatus === 'active');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(s => s.accountStatus === 'inactive');
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.email.toLowerCase().includes(term) ||
        s.branch.toLowerCase().includes(term)
      );
    }
    
    // Apply placement filter
    if (placementFilter !== 'all') {
      filtered = filtered.filter(s => 
        placementFilter === 'placed' ? s.placement.placed : !s.placement.placed
      );
    }
    
    // Apply branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(s => s.branch === branchFilter);
    }
    
    // Apply CGPA filter
    if (cgpaFilter !== null) {
      filtered = filtered.filter(s => s.cgpa >= cgpaFilter);
    }
    
    // Apply salary filter
    if (salaryFilter !== null) {
      filtered = filtered.filter(s => 
        s.placement.placed && 
        s.placement.package && 
        s.placement.package >= salaryFilter * 100000
      );
    }
    
    // Apply intern filter
    if (internFilter !== 'all') {
      if (internFilter === 'none') {
        // Students without FTE placement (unplaced or intern only)
        filtered = filtered.filter(s => 
          !s.placement.placed || 
          (s.placement.placed && s.placement.type === 'intern')
        );
      } else if (internFilter === 'noplacement') {
        // Students with no placement at all (not placed)
        filtered = filtered.filter(s => !s.placement.placed);
      } else {
        // Students with the specified placement type
        filtered = filtered.filter(s => 
          s.placement.placed && 
          s.placement.type === internFilter
        );
      }
    }
    
    // Apply salary percentage filter
    if (salaryPercentFilter !== null) {
      filtered = filtered.filter(student => {
        // Include unplaced students
        if (!student.placement.placed || !student.placement.package) {
          return true;
        }
        
        // For placed students, check if their salary is less than or equal to input/1.5
        // This means the input amount is ≥ 150% of their salary
        const targetSalary = salaryPercentFilter;
        const studentSalary = student.placement.package;
        
        // The input amount should be >= 150% of the student's salary
        // So studentSalary <= targetSalary / 1.5
        return studentSalary <= (targetSalary / 1.5);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'branch') {
        return sortDirection === 'asc' 
          ? a.branch.localeCompare(b.branch) 
          : b.branch.localeCompare(a.branch);
      } else if (sortField === 'salary') {
        const aPackage = a.placement.placed ? (a.placement.package || 0) : 0;
        const bPackage = b.placement.placed ? (b.placement.package || 0) : 0;
        return sortDirection === 'asc' 
          ? aPackage - bPackage 
          : bPackage - aPackage;
      } else { // cgpa
        return sortDirection === 'asc' 
          ? a.cgpa - b.cgpa 
          : b.cgpa - a.cgpa;
      }
    });
    
    setFilteredStudents(filtered);
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 font-medium text-indigo-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <Card className="w-full max-w-md border-2 border-red-200 shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in as an administrator to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button 
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-10">
      {/* <Navbar user={session?.user} /> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />
        
        {/* Applied Filter Tags */}
        <FilterTags 
          filterTags={filterTags} 
          onRemoveTag={removeFilterTag} 
          onClearAll={clearAllFilters} 
        />
        
        {/* Filters and Students Table */}
        <FilterControls
          branches={branches}
          minCGPA={minCGPA}
          maxCGPA={maxCGPA}
          minSalary={minSalary}
          maxSalary={maxSalary}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          cgpaFilter={cgpaFilter}
          setCgpaFilter={setCgpaFilter}
          salaryFilter={salaryFilter}
          setSalaryFilter={setSalaryFilter}
          internFilter={internFilter}
          setInternFilter={setInternFilter}
          salaryPercentFilter={salaryPercentFilter}
          setSalaryPercentFilter={setSalaryPercentFilter}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        >
          <TabsContent value="all" className="mt-6">
            <StudentTable 
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              error={error}
              onStudentUpdated={fetchStudents}
            />
          </TabsContent>
          <TabsContent value="placed" className="mt-6">
            <StudentTable 
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              error={error}
              onStudentUpdated={fetchStudents}
            />
          </TabsContent>
          <TabsContent value="unplaced" className="mt-6">
            <StudentTable 
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              error={error}
              onStudentUpdated={fetchStudents}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-6">
            <StudentTable 
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              error={error}
              onStudentUpdated={fetchStudents}
            />
          </TabsContent>
          <TabsContent value="inactive" className="mt-6">
            <StudentTable 
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              error={error}
              onStudentUpdated={fetchStudents}
            />
          </TabsContent>
        </FilterControls>
      </main>
    </div>
  );
}