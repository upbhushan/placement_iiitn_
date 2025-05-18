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
                value={`₹${((analyticsData?.averagePackage ?? 0) / 1_00_000).toFixed(2)} LPA`}
                description="For placed students"
                trend="up"
              />
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="distribution" className="mb-8">
                <TabsList className="mb-4">
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="placement">Placement</TabsTrigger>
                    <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
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
                                            innerRadius={40}  // Adding inner radius for donut chart
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={2}  // Add spacing between segments
                                            label={({ name, value, percent }) => 
                                                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                            }
                                        >
                                            {analyticsData?.branchDistribution?.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]}
                                                    stroke="#ffffff"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-4 rounded-md shadow-lg border border-gray-200">
                                                            <p className="font-semibold">{data.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Students: <span className="font-medium">{data.value}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Percentage: <span className="font-medium">
                                                                    {((data.value / (analyticsData?.totalStudents ?? 1)) * 100).toFixed(1)}%
                                                                </span>
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
                                    <BarChart data={analyticsData?.cgpaDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            formatter={(value) => [`${value} students`]}
                                            contentStyle={{ borderRadius: '8px' }}
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar 
                                            dataKey="value" 
                                            name="Students" 
                                            fill="url(#cgpaGradient)"
                                            radius={[4, 4, 0, 0]}  // Rounded corners on top
                                        />
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
                                            labelLine={true}
                                            outerRadius={80}
                                            innerRadius={40}  // Adding inner radius for donut chart
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={4}  // Add spacing between segments
                                            label={({ name, value, percent }) => 
                                                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                            }
                                        >
                                            <Cell fill="#4ade80" stroke="#ffffff" strokeWidth={2} />
                                            <Cell fill="#f87171" stroke="#ffffff" strokeWidth={2} />
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value, name) => [`${value} students`, `${name}`]}
                                            contentStyle={{ borderRadius: '8px' }}
                                        />
                                        <Legend 
                                            layout="horizontal" 
                                            verticalAlign="bottom" 
                                            align="center"
                                            formatter={(value) => <span style={{ color: value === 'Placed' ? '#4ade80' : '#f87171' }}>{value}</span>}
                                        />
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
                                    <BarChart data={analyticsData?.packageDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="packageGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0.3}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            formatter={(value) => [`${value} students`]}
                                            contentStyle={{ borderRadius: '8px' }}
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar 
                                            dataKey="value" 
                                            name="Students" 
                                            fill="url(#packageGradient)"
                                            radius={[4, 4, 0, 0]}  // Rounded corners on top
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Placement Success vs CGPA</CardTitle>
                                <CardDescription>Analysis of placement success across CGPA ranges</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            ...analyticsData?.cgpaDistribution?.map((item) => {
                                                const range = item.name;
                                                const totalInRange = item.value;
                                                
                                                // Calculate placed students in this CGPA range
                                                let placedInRange = 0;
                                                let avgPackage = 0;
                                                
                                                // You would need to calculate this from your student data
                                                // This is just a placeholder for the concept
                                                const placedStudentsInRange = students.filter(s => {
                                                    const cgpa = s.cgpa;
                                                    if (range === 'Below 6' && cgpa < 6 && s.placement.placed) return true;
                                                    if (range === '6-7' && cgpa >= 6 && cgpa < 7 && s.placement.placed) return true;
                                                    if (range === '7-8' && cgpa >= 7 && cgpa < 8 && s.placement.placed) return true;
                                                    if (range === '8-9' && cgpa >= 8 && cgpa < 9 && s.placement.placed) return true;
                                                    if (range === '9-10' && cgpa >= 9 && cgpa <= 10 && s.placement.placed) return true;
                                                    return false;
                                                });
                                                
                                                placedInRange = placedStudentsInRange.length;
                                                
                                                // Calculate average package for this range
                                                if (placedInRange > 0) {
                                                    avgPackage = placedStudentsInRange.reduce((sum, s) => 
                                                        sum + (s.placement.package || 0), 0) / placedInRange;
                                                }
                                                
                                                // Calculate placement rate
                                                const placementRate = totalInRange > 0 
                                                    ? (placedInRange / totalInRange) * 100 
                                                    : 0;
                                                
                                                return {
                                                    name: range,
                                                    placementRate: placementRate.toFixed(1),
                                                    avgPackage: avgPackage.toFixed(1),
                                                    students: totalInRange
                                                };
                                            }) || []
                                        ]}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                        <Legend />
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="placementRate" 
                                            name="Placement Rate (%)" 
                                            stroke="#8884d8" 
                                            activeDot={{ r: 8 }}
                                            strokeWidth={2}
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="avgPackage" 
                                            name="Avg. Package (LPA)" 
                                            stroke="#82ca9d"
                                            strokeWidth={2} 
                                        />
                                    </LineChart>
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