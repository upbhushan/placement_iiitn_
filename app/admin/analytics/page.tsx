"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Types for our student data
interface StudentData {
    _id: string;
    name: string;
    email: string;
    branch: string;
    cgpa: number;
    activeBacklogs: number;
    gender: string;
    placement: {
        placed: boolean;
        company?: string;
        package?: number;
        type?: 'intern' | 'fte' | 'both';
    };
    accountStatus: 'active' | 'inactive' | 'blocked';
}

// Types for analytics data
interface AnalyticsData {
    totalStudents: number;
    placedStudents: number;
    averageCGPA: number;
    averagePackage: number;
    branchDistribution: { name: string; value: number }[];
    placementDistribution: { name: string; value: number }[];
    packageDistribution: { name: string; value: number }[];
    cgpaDistribution: { name: string; value: number }[];
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            try {
                // In a real application, this would be a call to your API
                const response = await fetch('/api/admin/students/analytics');
                const data = await response.json();

                // For demo purposes, we'll create mock data if the API call fails
                let studentData: StudentData[];

                if (!response.ok) {
                    // Generate mock data for demonstration
                    studentData = generateMockStudents(100);
                } else {
                    studentData = data.students;
                }

                setStudents(studentData);

                // Process the data to get analytics
                processAnalyticsData(studentData);
            } catch (error) {
                console.error('Error fetching students:', error);
                // Generate mock data if there's an error
                const mockData = generateMockStudents(100);
                setStudents(mockData);
                processAnalyticsData(mockData);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStudents();
    }, []);

    // Process student data to generate analytics
    function processAnalyticsData(studentData: StudentData[]) {
        // Calculate basic metrics
        const totalStudents = studentData.length;
        const placedStudents = studentData.filter(s => s.placement.placed).length;

        const totalCGPA = studentData.reduce((sum, student) => sum + student.cgpa, 0);
        const averageCGPA = totalCGPA / totalStudents;

        const placedStudentsWithPackage = studentData.filter(s => s.placement.placed && s.placement.package);
        const totalPackage = placedStudentsWithPackage.reduce((sum, student) =>
            sum + (student.placement.package || 0), 0);
        const averagePackage = placedStudentsWithPackage.length > 0 ?
            totalPackage / placedStudentsWithPackage.length : 0;

        // Branch distribution
        const branchCounts: Record<string, number> = {};
        studentData.forEach(student => {
            branchCounts[student.branch] = (branchCounts[student.branch] || 0) + 1;
        });

        const branchDistribution = Object.entries(branchCounts).map(
            ([name, value]) => ({ name, value })
        );

        // Placement distribution
        const placementDistribution = [
            { name: 'Placed', value: placedStudents },
            { name: 'Not Placed', value: totalStudents - placedStudents }
        ];

        // Package distribution for placed students
        const packageRanges: Record<string, number> = {
            '0-5 LPA': 0,
            '5-10 LPA': 0,
            '10-15 LPA': 0,
            '15-20 LPA': 0,
            '20+ LPA': 0
        };

        placedStudentsWithPackage.forEach(student => {
            const pkg = student.placement.package || 0;
            if (pkg <= 5) packageRanges['0-5 LPA']++;
            else if (pkg <= 10) packageRanges['5-10 LPA']++;
            else if (pkg <= 15) packageRanges['10-15 LPA']++;
            else if (pkg <= 20) packageRanges['15-20 LPA']++;
            else packageRanges['20+ LPA']++;
        });

        const packageDistribution = Object.entries(packageRanges).map(
            ([name, value]) => ({ name, value })
        );

        // CGPA distribution
        const cgpaRanges: Record<string, number> = {
            'Below 6': 0,
            '6-7': 0,
            '7-8': 0,
            '8-9': 0,
            '9-10': 0
        };

        studentData.forEach(student => {
            const cgpa = student.cgpa;
            if (cgpa < 6) cgpaRanges['Below 6']++;
            else if (cgpa < 7) cgpaRanges['6-7']++;
            else if (cgpa < 8) cgpaRanges['7-8']++;
            else if (cgpa < 9) cgpaRanges['8-9']++;
            else cgpaRanges['9-10']++;
        });

        const cgpaDistribution = Object.entries(cgpaRanges).map(
            ([name, value]) => ({ name, value })
        );

        setAnalyticsData({
            totalStudents,
            placedStudents,
            averageCGPA,
            averagePackage,
            branchDistribution,
            placementDistribution,
            packageDistribution,
            cgpaDistribution
        });
    }

    // Mock data generator for demonstration purposes
    function generateMockStudents(count: number): StudentData[] {
        const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
        const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'IBM', 'Accenture'];

        return Array.from({ length: count }, (_, i) => {
            const placed = Math.random() > 0.3;
            return {
                _id: `student-${i}`,
                name: `Student ${i}`,
                email: `student${i}@example.com`,
                branch: branches[Math.floor(Math.random() * branches.length)],
                cgpa: Math.round((Math.random() * 4 + 6) * 10) / 10, // CGPA between 6 and 10
                activeBacklogs: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
                gender: Math.random() > 0.5 ? 'male' : 'female',
                placement: {
                    placed,
                    company: placed ? companies[Math.floor(Math.random() * companies.length)] : undefined,
                    package: placed ? Math.round((Math.random() * 25 + 5) * 10) / 10 : undefined, // Package between 5 and 30 LPA
                    type: placed ? ['intern', 'fte', 'both'][Math.floor(Math.random() * 3)] as 'intern' | 'fte' | 'both' : undefined
                },
                accountStatus: 'active'
            };
        });
    }

    if (isLoading) {
        return <AnalyticsSkeletonLoader />;
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Students"
                    value={analyticsData?.totalStudents.toString() || '0'}
                    description="Registered in the system"
                    trend="neutral"
                />
                <MetricCard
                    title="Students Placed"
                    value={analyticsData?.placedStudents.toString() || '0'}
                    description={`${analyticsData?.placedStudents && analyticsData?.totalStudents
                        ? Math.round((analyticsData.placedStudents / analyticsData.totalStudents) * 100)
                        : 0}% placement rate`}
                    trend="up"
                />
                <MetricCard
                    title="Average CGPA"
                    value={analyticsData?.averageCGPA.toFixed(2) || '0'}
                    description="Across all students"
                    trend="neutral"
                />
                <MetricCard
                    title="Average Package"
                    value={`₹${analyticsData?.averagePackage.toFixed(2) || '0'} LPA`}
                    description="For placed students"
                    trend="up"
                />
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="distribution" className="mb-8">
                <TabsList className="mb-4">
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="placement">Placement</TabsTrigger>
                </TabsList>

                <TabsContent value="distribution" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Branch Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Distribution</CardTitle>
                                <CardDescription>Students by academic branch</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData?.branchDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {analyticsData?.branchDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* CGPA Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>CGPA Distribution</CardTitle>
                                <CardDescription>Student count by CGPA range</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.cgpaDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Students" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="placement" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Placement Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Placement Status</CardTitle>
                                <CardDescription>Placed vs Unplaced students</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData?.placementDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            <Cell fill="#4ade80" />
                                            <Cell fill="#f87171" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Package Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Package Distribution</CardTitle>
                                <CardDescription>Student count by package range</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData?.packageDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Students" fill="#4ade80" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper Components

function MetricCard({ title, value, description, trend }: {
    title: string,
    value: string,
    description: string,
    trend: 'up' | 'down' | 'neutral'
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function AnalyticsSkeletonLoader() {
    return (
        <div className="container py-10">
            <Skeleton className="h-10 w-64 mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Skeleton className="h-10 w-96 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-80 w-full rounded-md" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}