// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { motion } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import { useTheme } from 'next-themes';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { CalendarIcon, BriefcaseIcon, BuildingIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react';

// // Dummy opportunities data - Replace with API call
// const opportunitiesData = {
//   active: [
//     {
//       id: '1',
//       companyName: 'Google',
//       role: 'Software Engineer',
//       location: 'Bangalore, India',
//       package: '25-30 LPA',
//       deadline: '2025-05-15',
//       eligibility: {
//         cgpa: 8.0,
//         branches: ['CSE', 'IT', 'ECE'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 42,
//       postedDate: '2025-04-01',
//       logo: '/logos/google.png',
//       status: 'active'
//     },
//     {
//       id: '2',
//       companyName: 'Microsoft',
//       role: 'Data Engineer',
//       location: 'Hyderabad, India',
//       package: '22-28 LPA',
//       deadline: '2025-05-10',
//       eligibility: {
//         cgpa: 7.5,
//         branches: ['CSE', 'IT', 'ECE', 'EEE'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 36,
//       postedDate: '2025-04-02',
//       logo: '/logos/microsoft.png',
//       status: 'active'
//     },
//     {
//       id: '3',
//       companyName: 'Amazon',
//       role: 'SDE-1',
//       location: 'Hyderabad, India',
//       package: '20-26 LPA',
//       deadline: '2025-05-20',
//       eligibility: {
//         cgpa: 7.0,
//         branches: ['CSE', 'IT', 'ECE'],
//         backlogs: 1
//       },
//       type: 'Full-time',
//       applicationsCount: 65,
//       postedDate: '2025-04-03',
//       logo: '/logos/amazon.png',
//       status: 'active'
//     },
//     {
//       id: '4',
//       companyName: 'Intel',
//       role: 'Hardware Engineer',
//       location: 'Bangalore, India',
//       package: '18-22 LPA',
//       deadline: '2025-05-25',
//       eligibility: {
//         cgpa: 7.5,
//         branches: ['ECE', 'EEE'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 28,
//       postedDate: '2025-04-05',
//       logo: '/logos/intel.png',
//       status: 'active'
//     },
//   ],
//   closed: [
//     {
//       id: '5',
//       companyName: 'Apple',
//       role: 'iOS Developer',
//       location: 'Bangalore, India',
//       package: '26-32 LPA',
//       deadline: '2025-03-30',
//       eligibility: {
//         cgpa: 8.0,
//         branches: ['CSE', 'IT'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 35,
//       postedDate: '2025-03-01',
//       closedDate: '2025-03-30',
//       logo: '/logos/apple.png',
//       status: 'closed',
//       selectedCount: 8
//     },
//     {
//       id: '6',
//       companyName: 'Goldman Sachs',
//       role: 'Financial Analyst',
//       location: 'Bangalore, India',
//       package: '24-30 LPA',
//       deadline: '2025-03-25',
//       eligibility: {
//         cgpa: 8.0,
//         branches: ['CSE', 'IT', 'ECE', 'EEE'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 48,
//       postedDate: '2025-03-05',
//       closedDate: '2025-03-25',
//       logo: '/logos/goldman.png',
//       status: 'closed',
//       selectedCount: 12
//     },
//     {
//       id: '7',
//       companyName: 'Adobe',
//       role: 'Product Designer',
//       location: 'Noida, India',
//       package: '18-24 LPA',
//       deadline: '2025-03-20',
//       eligibility: {
//         cgpa: 7.5,
//         branches: ['CSE', 'IT', 'Design'],
//         backlogs: 0
//       },
//       type: 'Full-time',
//       applicationsCount: 32,
//       postedDate: '2025-02-28',
//       closedDate: '2025-03-20',
//       logo: '/logos/adobe.png',
//       status: 'closed',
//       selectedCount: 6
//     },
//   ],
//   applied: [
//     {
//       id: '2',
//       companyName: 'Microsoft',
//       role: 'Data Engineer',
//       appliedDate: '2025-04-10',
//       status: 'Applied',
//       nextSteps: 'Waiting for shortlist',
//     },
//     {
//       id: '3',
//       companyName: 'Amazon',
//       role: 'SDE-1',
//       appliedDate: '2025-04-08',
//       status: 'Shortlisted',
//       nextSteps: 'Online Assessment on 2025-04-25',
//       interviewRounds: [
//         { name: 'Online Assessment', date: '2025-04-25', status: 'upcoming' },
//         { name: 'Technical Interview', date: null, status: 'pending' },
//         { name: 'HR Interview', date: null, status: 'pending' }
//       ]
//     },
//   ]
// };

// function OpportunitySkeleton() {
//   return (
//     <div className="space-y-3">
//       <div className="w-2/5 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
//       <div className="w-3/5 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
//       <div className="flex gap-2 mt-4">
//         <div className="w-24 h-7 bg-gray-200 dark:bg-gray-800 rounded"></div>
//         <div className="w-24 h-7 bg-gray-200 dark:bg-gray-800 rounded"></div>
//       </div>
//       <div className="flex justify-between mt-4">
//         <div className="w-28 h-9 bg-gray-200 dark:bg-gray-800 rounded"></div>
//         <div className="w-28 h-9 bg-gray-200 dark:bg-gray-800 rounded"></div>
//       </div>
//     </div>
//   );
// }

// export default function OpportunitiesPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { theme } = useTheme();
//   const [isLoading, setIsLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCriteria, setFilterCriteria] = useState({
//     role: [],
//     location: [],
//     package: []
//   });
  
//   useEffect(() => {
//     setMounted(true);
    
//     // Simulate data loading
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 800);
    
//     return () => clearTimeout(timer);
//   }, []);
  
//   // Protect route
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//   }, [status, router]);

//   // Filter opportunities based on search term
//   const filteredActive = opportunitiesData.active.filter(opp => 
//     opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     opp.role.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredClosed = opportunitiesData.closed.filter(opp => 
//     opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     opp.role.toLowerCase().includes(searchTerm.toLowerCase())
//   );

// // Calculate days left until deadline
// // Define interfaces for opportunity objects
// interface BaseOpportunity {
//   id: string;
//   companyName: string;
//   role: string;
//   type?: string;
//   logo?: string;
// }

// interface ActiveOpportunity extends BaseOpportunity {
//   location: string;
//   package: string;
//   deadline: string;
//   eligibility: {
//     cgpa: number;
//     branches: string[];
//     backlogs: number;
//   };
//   applicationsCount: number;
//   postedDate: string;
//   status: 'active';
// }

// interface ClosedOpportunity extends BaseOpportunity {
//   location: string;
//   package: string;
//   deadline: string;
//   eligibility: {
//     cgpa: number;
//     branches: string[];
//     backlogs: number;
//   };
//   applicationsCount: number;
//   postedDate: string;
//   closedDate: string;
//   selectedCount: number;
//   status: 'closed';
// }

// interface AppliedOpportunity extends BaseOpportunity {
//   appliedDate: string;
//   status: string;
//   nextSteps: string;
//   interviewRounds?: {
//     name: string;
//     date: string | null;
//     status: 'upcoming' | 'completed' | 'pending';
//   }[];
// }

// type Opportunity = ActiveOpportunity | ClosedOpportunity | AppliedOpportunity;

// const getDaysLeft = (deadline: string): number => {
//     const today: Date = new Date();
//     const deadlineDate: Date = new Date(deadline);
//     const diffTime: number = deadlineDate.getTime() - today.getTime();
//     const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
// };

//   if (status === 'loading' || !mounted) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="space-y-8">
//           <div className="space-y-2">
//             <Skeleton className="h-12 w-3/4" />
//             <Skeleton className="h-6 w-1/2" />
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl">
//                 <CardContent className="p-6">
//                   <OpportunitySkeleton />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="mb-8"
//       >
//         <h1 className="text-4xl font-medium tracking-tight mb-4">
//           Opportunities
//         </h1>
//         <p className="text-xl text-muted-foreground max-w-3xl">
//           Explore all available and past placement opportunities
//         </p>
//       </motion.div>
      
//       {/* Search & Filter */}
//       <div className="flex flex-col md:flex-row gap-4 mb-8">
//         <div className="flex-1">
//           <input
//             type="text"
//             placeholder="Search by company or role..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-background"
//           />
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline">
//             <FilterIcon className="h-4 w-4 mr-2" />
//             Filter
//           </Button>
//           <Button variant="outline">
//             <SortIcon className="h-4 w-4 mr-2" />
//             Sort
//           </Button>
//         </div>
//       </div>
      
//       {/* Tabs */}
//       <Tabs defaultValue="active" className="mb-8">
//         <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="applied">Applied</TabsTrigger>
//           <TabsTrigger value="closed">Closed</TabsTrigger>
//         </TabsList>
        
//         {/* Active Opportunities */}
//         <TabsContent value="active">
//           {isLoading ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[1, 2, 3, 4].map((i) => (
//                 <Card key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl">
//                   <CardContent className="p-6">
//                     <OpportunitySkeleton />
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <>
//               {filteredActive.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {filteredActive.map((opportunity) => (
//                     <OpportunityCard 
//                       key={opportunity.id}
//                       opportunity={opportunity}
//                       isActive={true}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-4">
//                     <SearchIcon className="h-6 w-6" />
//                   </div>
//                   <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
//                   <p className="text-muted-foreground">Try adjusting your search or filters</p>
//                 </div>
//               )}
//             </>
//           )}
//         </TabsContent>
        
//         {/* Applied Opportunities */}
//         <TabsContent value="applied">
//           {opportunitiesData.applied.length > 0 ? (
//             <div className="space-y-6">
//               {opportunitiesData.applied.map((opportunity) => (
//                 <Card key={opportunity.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
//                   <div className="border-l-4 border-blue-500">
//                     <CardContent className="p-6">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <h3 className="text-lg font-semibold">{opportunity.role}</h3>
//                             <span className="text-sm text-muted-foreground">@</span>
//                             <h4 className="font-medium">{opportunity.companyName}</h4>
//                           </div>
//                           <p className="text-sm text-muted-foreground mt-1">Applied on {new Date(opportunity.appliedDate).toLocaleDateString()}</p>
//                         </div>
//                         <StatusBadge status={opportunity.status} />
//                       </div>
                      
//                       <div className="mt-4">
//                         <h5 className="text-sm font-medium mb-2">Next Steps</h5>
//                         <p className="text-sm">{opportunity.nextSteps}</p>
//                       </div>
                      
//                       {opportunity.interviewRounds && (
//                         <div className="mt-4 space-y-2">
//                           <h5 className="text-sm font-medium">Interview Process</h5>
//                           <div className="flex items-center gap-4 flex-wrap">
//                             {opportunity.interviewRounds.map((round, index) => (
//                               <div 
//                                 key={index}
//                                 className={`flex items-center gap-2 p-2 border rounded-md text-xs ${
//                                   round.status === 'upcoming' 
//                                     ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20' 
//                                     : 'border-gray-200 dark:border-gray-700'
//                                 }`}
//                               >
//                                 {round.status === 'upcoming' ? (
//                                   <AlertCircleIcon className="h-3 w-3 text-blue-500" />
//                                 ) : round.status === 'completed' ? (
//                                   <CheckCircleIcon className="h-3 w-3 text-green-500" />
//                                 ) : (
//                                   <ClockIcon className="h-3 w-3" />
//                                 )}
//                                 <span>{round.name}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
                      
//                       <div className="flex justify-end mt-6">
//                         <Button variant="outline" size="sm">
//                           View Details
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           ) : (
// function OpportunityCard({ opportunity, isActive }: { opportunity: Opportunity; isActive: boolean }) {
//   const daysLeft = isActive ? getDaysLeft(opportunity.deadline) : null;
//   return <></>; // Placeholder implementation
// }
//             <div className="text-center py-12">
//               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
//                 <BriefcaseIcon className="h-6 w-6 text-gray-500" />
//               </div>
//               <h3 className="text-lg font-medium mb-2">No applications yet</h3>
//               <p className="text-muted-foreground mb-6">You haven't applied to any opportunities yet</p>
//               <Button onClick={() => {
//                 const activeTab = document.querySelector('[data-value="active"]');
//                 if (activeTab && activeTab instanceof HTMLElement) {
//                   activeTab.click();
//                 }
//               }}>
//                 Browse Opportunities
//               </Button>
//             </div>
//           )}
//         </TabsContent>
        
//         {/* Closed Opportunities */}
//         <TabsContent value="closed">
//           {filteredClosed.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {filteredClosed.map((opportunity) => (
//                 <OpportunityCard 
//                   key={opportunity.id}
//                   opportunity={opportunity}
//                   isActive={false}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
//                 <ArchiveIcon className="h-6 w-6 text-gray-500" />
//               </div>
//               <h3 className="text-lg font-medium mb-2">No closed opportunities</h3>
//               <p className="text-muted-foreground">Check back later for past opportunities</p>
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Opportunity Card Component
// function OpportunityCard({ opportunity, isActive }) {
//   const daysLeft = isActive ? getDaysLeft(opportunity.deadline) : null;
  
//   return (
//     <Card className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
//       <CardContent className="p-0">
//         {/* Top highlight strip based on status */}
//         <div 
//           className={`h-1 ${
//             isActive 
//               ? daysLeft <= 3 ? 'bg-orange-500' : 'bg-green-500' 
//               : 'bg-gray-400'
//           }`}
//         />
        
//         <div className="p-6">
//           {/* Company & Role */}
//           <div className="flex justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">{opportunity.role}</h3>
//               <div className="flex items-center mt-1">
//                 <BuildingIcon className="h-4 w-4 text-muted-foreground mr-1" />
//                 <span className="text-muted-foreground">{opportunity.companyName}</span>
//               </div>
//             </div>
//             <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
//               {/* Company Logo placeholder */}
//               <div className="text-xl font-bold">{opportunity.companyName[0]}</div>
//             </div>
//           </div>
          
//           {/* Key details */}
//           <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4">
//             <div className="flex items-center text-sm">
//               <MapPinIcon className="h-4 w-4 mr-1" />
//               <span>{opportunity.location}</span>
//             </div>
//             <div className="flex items-center text-sm">
//               <BriefcaseIcon className="h-4 w-4 mr-1" />
//               <span>{opportunity.package}</span>
//             </div>
//             <div className="flex items-center text-sm">
//               <CalendarIcon className="h-4 w-4 mr-1" />
//               <span>{isActive ? 'Deadline: ' + new Date(opportunity.deadline).toLocaleDateString() : 'Closed: ' + new Date(opportunity.closedDate).toLocaleDateString()}</span>
//             </div>
//           </div>
          
//           {/* Tags */}
//           <div className="mt-4 flex flex-wrap gap-2">
//             <Badge variant="secondary">{opportunity.type}</Badge>
//             {opportunity.eligibility.branches.map((branch) => (
//               <Badge key={branch} variant="outline">{branch}</Badge>
//             ))}
//           </div>
          
//           {/* Status/CTA */}
//           <div className="mt-6 flex justify-between items-center">
//             {isActive ? (
//               <>
//                 <div className="flex items-center">
//                   <ClockIcon className="h-4 w-4 mr-1" />
//                   <span className={`text-sm ${daysLeft <= 3 ? 'text-orange-500 font-medium' : ''}`}>
//                     {daysLeft === 0 ? 'Due today' : daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
//                   </span>
//                 </div>
//                 <Button>Apply Now</Button>
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center">
//                   <UsersIcon className="h-4 w-4 mr-1" />
//                   <span className="text-sm text-muted-foreground">
//                     {opportunity.selectedCount} selected out of {opportunity.applicationsCount} applications
//                   </span>
//                 </div>
//                 <Button variant="outline" size="sm">View Results</Button>
//               </>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function StatusBadge({ status }) {
//   let bgColor, textColor, icon;
  
//   switch (status) {
//     case 'Applied':
//       bgColor = 'bg-blue-50 dark:bg-blue-900/20';
//       textColor = 'text-blue-600 dark:text-blue-400';
//       icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
//       break;
//     case 'Shortlisted':
//       bgColor = 'bg-green-50 dark:bg-green-900/20';
//       textColor = 'text-green-600 dark:text-green-400';
//       icon = <CheckCircleIcon className="h-3 w-3 mr-1" />;
//       break;
//     case 'Under Review':
//       bgColor = 'bg-orange-50 dark:bg-orange-900/20';
//       textColor = 'text-orange-600 dark:text-orange-400';
//       icon = <ClockIcon className="h-3 w-3 mr-1" />;
//       break;
//     case 'Rejected':
//       bgColor = 'bg-red-50 dark:bg-red-900/20';
//       textColor = 'text-red-600 dark:text-red-400';
//       icon = <XCircleIcon className="h-3 w-3 mr-1" />;
//       break;
//     default:
//       bgColor = 'bg-gray-50 dark:bg-gray-800';
//       textColor = 'text-gray-600 dark:text-gray-400';
//       icon = <AlertCircleIcon className="h-3 w-3 mr-1" />;
//   }
  
//   return (
//     <div className={`flex items-center py-1 px-2 rounded ${bgColor} ${textColor} text-xs font-medium`}>
//       {icon}
//       {status}
//     </div>
//   );
// }

// // Import these icons
// const MapPinIcon = ({ className }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
//     <circle cx="12" cy="10" r="3"/>
//   </svg>
// );

// const FilterIcon = ({ className }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
//   </svg>
// );

// const SortIcon = ({ className }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="m3 16 4 4 4-4"/>
//     <path d="M7 20V4"/>
//     <path d="m21 8-4-4-4 4"/>
//     <path d="M17 4v16"/>
//   </svg>
// );

// const SearchIcon = ({ className }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <circle cx="11" cy="11" r="8"/>
//     <path d="m21 21-4.3-4.3"/>
//   </svg>
// );

// const ArchiveIcon = ({ className }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <rect width="20" height="5" x="2" y="3" rx="1"/>
//     <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
//     <path d="M10 12h4"/>
//   </svg>
// );