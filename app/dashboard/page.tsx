'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { ArrowUpRightIcon, TrendingUpIcon, UsersIcon, BriefcaseIcon, BookOpenIcon, LaptopIcon } from 'lucide-react';
import Link from 'next/link';

// Dummy data - Replace with real data from API/CSV
const placementData = {
  overview: {
    totalStudents: 240,
    totalPlaced: 186,
    highestPackage: 45.0,
    averagePackage: 12.8,
    medianPackage: 10.5,
    premiumOffers: 42, // Above 20 LPA
  },
  placementStatus: [
    { name: 'Placed', value: 186 },
    { name: 'Unplaced', value: 54 },
  ],
  domainStats: [
    { name: 'Software Development', students: 78 },
    { name: 'Data Science & ML', students: 42 },
    { name: 'Cybersecurity', students: 24 },
    { name: 'Cloud Computing', students: 18 },
    { name: 'DevOps', students: 14 },
    { name: 'Product Management', students: 10 },
  ],
  packageDistribution: [
    { range: '5-8 LPA', count: 38 },
    { range: '8-12 LPA', count: 64 },
    { range: '12-16 LPA', count: 36 },
    { range: '16-20 LPA', count: 26 },
    { range: '20-25 LPA', count: 14 },
    { range: '25+ LPA', count: 8 },
  ],
  monthlyTrend: [
    { month: 'Jul', placements: 12 },
    { month: 'Aug', placements: 18 },
    { month: 'Sep', placements: 24 },
    { month: 'Oct', placements: 32 },
    { month: 'Nov', placements: 45 },
    { month: 'Dec', placements: 55 },
  ],
  topCompanies: [
    { name: 'Google', offers: 12, avgPackage: 32.4 },
    { name: 'Microsoft', offers: 18, avgPackage: 25.7 },
    { name: 'Amazon', offers: 24, avgPackage: 22.8 },
    { name: 'Apple', offers: 8, avgPackage: 28.5 },
    { name: 'Goldman Sachs', offers: 15, avgPackage: 24.2 },
  ],
};

// COLORS - Following Apple's design language
const COLORS = ['#06c', '#5ac8fa', '#30b0c7', '#34c759', '#af52de', '#ff9500', '#ff3b30'];
const CHART_GRADIENTS = {
  blue: ['#0066cc', '#5ac8fa'],
  purple: ['#af52de', '#5e5ce6'],
  orange: ['#ff9500', '#ff3b30'],
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Protect route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading' || !mounted) {
    return <DashboardSkeleton />;
  }

  // For calculating percentage increase in a metric
  const getPercentage = () => {
    // This would normally calculate based on previous data
    return Math.floor(Math.random() * 20 + 5);
  };

  // Dynamic chart colors based on theme
  const getChartColors = () => {
    return theme === 'dark' ? {
      area: 'rgba(100, 210, 255, 0.2)',
      stroke: '#64d2ff',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: 'rgba(255, 255, 255, 0.6)',
    } : {
      area: 'rgba(0, 100, 220, 0.1)',
      stroke: '#0070f3',
      grid: 'rgba(0, 0, 0, 0.05)',
      text: 'rgba(0, 0, 0, 0.6)',
    };
  };
  
  const chartColors = getChartColors();
  const placementPercentage = (placementData.overview.totalPlaced / placementData.overview.totalStudents) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-medium tracking-tight mb-4">
          Placement Analytics
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Comprehensive overview of placement statistics and performance insights.
        </p>
      </motion.div>
      
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-8">
          {/* Key Stats Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Placed" 
              value={placementData.overview.totalPlaced} 
              total={placementData.overview.totalStudents}
              percentage={placementPercentage.toFixed(1)}
              trend={getPercentage()}
              icon={<UsersIcon className="h-4 w-4" />}
              gradientFrom="#0066cc"
              gradientTo="#5ac8fa"
            />
            
            <StatsCard 
              title="Highest Package" 
              value={placementData.overview.highestPackage} 
              unit="LPA"
              trend={getPercentage()}
              icon={<TrendingUpIcon className="h-4 w-4" />}
              gradientFrom="#af52de"
              gradientTo="#5e5ce6"
            />
            
            <StatsCard 
              title="Average Package" 
              value={placementData.overview.averagePackage} 
              unit="LPA"
              trend={getPercentage()}
              icon={<BriefcaseIcon className="h-4 w-4" />}
              gradientFrom="#ff9500"
              gradientTo="#ff3b30"
            />
            
            <StatsCard 
              title="Premium Offers" 
              subtitle="(20+ LPA)"
              value={placementData.overview.premiumOffers}
              trend={getPercentage()}
              icon={<ArrowUpRightIcon className="h-4 w-4" />}
              gradientFrom="#34c759"
              gradientTo="#30b0c7"
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Placement Status Chart */}
            <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Placement Status</CardTitle>
                <CardDescription>Overall placement statistics for current batch</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="pt-2 px-4 flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={placementData.placementStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1000}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {placementData.placementStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#0066cc' : '#ff9500'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800 mt-4">
                  <div className="py-4 px-6 text-center">
                    <div className="text-3xl font-semibold text-[#0066cc]">
                      {placementPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Placement Rate</div>
                  </div>
                  <div className="py-4 px-6 text-center">
                    <div className="text-3xl font-semibold text-[#ff9500]">
                      {(placementData.overview.totalStudents - placementData.overview.totalPlaced)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Yet to be Placed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Package Distribution Chart */}
            <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Package Distribution</CardTitle>
                <CardDescription>Count of students by package ranges</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={placementData.packageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="range" tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
                          borderColor: theme === 'dark' ? '#3a3a3c' : '#f1f1f1',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.blue[0]} stopOpacity={1}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.blue[1]} stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <Bar 
                        dataKey="count" 
                        fill="url(#barGradient)" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Trend */}
          <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium tracking-tight">Monthly Placement Trend</CardTitle>
              <CardDescription>Number of placements over time</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={placementData.monthlyTrend}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_GRADIENTS.purple[0]} stopOpacity={0.4}/>
                        <stop offset="100%" stopColor={CHART_GRADIENTS.purple[1]} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
                        borderColor: theme === 'dark' ? '#3a3a3c' : '#f1f1f1',
                        borderRadius: '8px' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="placements" 
                      stroke={CHART_GRADIENTS.purple[0]} 
                      fill="url(#areaGradient)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Domain Distribution Chart */}
            <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Domain Distribution</CardTitle>
                <CardDescription>Students by preferred domain</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={placementData.domainStats} 
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis type="number" tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: chartColors.text, fontSize: 12 }} 
                        width={150}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
                          borderColor: theme === 'dark' ? '#3a3a3c' : '#f1f1f1',
                          borderRadius: '8px'
                        }} 
                      />
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={CHART_GRADIENTS.orange[1]} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={CHART_GRADIENTS.orange[0]} stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <Bar 
                        dataKey="students" 
                        fill="url(#colorStudents)" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Domain Insights */}
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium tracking-tight">Domain Insights</CardTitle>
                  <CardDescription>Key takeaways from domain preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-800/50 p-2">
                        <LaptopIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Software Development</h4>
                        <p className="text-sm text-muted-foreground">Most popular domain with 78 students</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                      <div className="rounded-full bg-purple-100 dark:bg-purple-800/50 p-2">
                        <BookOpenIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Emerging Trend</h4>
                        <p className="text-sm text-muted-foreground">Data Science & ML seeing 45% growth from last year</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-4">
                      <p>The distribution shows strong alignment with industry demand, with software development and data science dominating preferences.</p>
                      <p className="mt-2">Students in cybersecurity and cloud computing are seeing the highest offer rates relative to domain size.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium tracking-tight">Domain Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start text-left">
                      <Link href="/resources/software-development">
                        <span>Software Development Resources</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-left">
                      <Link href="/resources/data-science">
                        <span>Data Science & ML Resources</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-left">
                      <Link href="/resources/cybersecurity">
                        <span>Cybersecurity Resources</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* COMPANIES TAB */}
        <TabsContent value="companies" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Top Companies Chart */}
            <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Top Recruiting Companies</CardTitle>
                <CardDescription>By number of offers made</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={placementData.topCompanies}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <YAxis yAxisId="left" orientation="left" tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
                          borderColor: theme === 'dark' ? '#3a3a3c' : '#f1f1f1',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0066cc" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#5ac8fa" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="colorPackage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#af52de" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <Bar 
                        yAxisId="left" 
                        dataKey="offers" 
                        fill="url(#colorOffers)" 
                        name="Number of Offers"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="avgPackage" 
                        stroke="#ff3b30" 
                        name="Avg. Package (LPA)"
                        animationDuration={2000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Company Leaderboard */}
            <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Package Leaderboard</CardTitle>
                <CardDescription>Top companies by package offered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {placementData.topCompanies
                    .sort((a, b) => b.avgPackage - a.avgPackage)
                    .map((company, index) => (
                      <div 
                        key={company.name}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100/80 dark:border-gray-800/60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-xs text-muted-foreground">{company.offers} offers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{company.avgPackage} LPA</div>
                          <div className="text-xs text-muted-foreground">avg. package</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions Section */}
      <div className="flex flex-wrap gap-4 items-center justify-center mt-12">
        <Button 
          asChild 
          className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary transition-all shadow-md px-6"
        >
          <Link href="/student/profile">
            Update Your Profile
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline"
          className="rounded-full border-gray-200/80 dark:border-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all px-6"
        >
          <Link href="/student/placements">
            View Placement Opportunities
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, subtitle, value, unit, total, percentage, trend, icon, gradientFrom, gradientTo }: {
  title: string;
  subtitle?: string;
  value: number;
  unit?: string;
  total?: number;
  percentage?: string;
  trend: number;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="h-1" style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {title} {subtitle && <span className="text-muted-foreground font-normal text-xs">{subtitle}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold">
                {value}{unit && <span className="text-lg ml-1">{unit}</span>}
              </div>
              {total && (
                <div className="text-sm text-muted-foreground mt-1">
                  out of {total} ({percentage}%)
                </div>
              )}
            </div>
            
            <div className="flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <ArrowUpRightIcon className="h-3 w-3 mr-1" />
              {trend}%
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-1 bg-gray-200 dark:bg-gray-800"></div>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="overflow-hidden mb-8">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}