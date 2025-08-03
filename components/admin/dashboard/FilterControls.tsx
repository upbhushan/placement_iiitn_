import { useState } from "react";
import { Search, Filter, ArrowUpDown, DollarSign, GraduationCap, BarChart4, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader,
  SheetTitle, SheetTrigger, SheetFooter, SheetClose
} from "@/components/ui/sheet";

interface FilterControlsProps {
  branches: string[];
  minCGPA: number;
  maxCGPA: number;
  minSalary: number;
  maxSalary: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  cgpaFilter: number | null;
  setCgpaFilter: (cgpa: number | null) => void;
  salaryFilter: number | null;
  setSalaryFilter: (salary: number | null) => void;
  internFilter: 'all' | 'intern' | 'fte' | 'both' | 'none' | 'noplacement';
  setInternFilter: (type: 'all' | 'intern' | 'fte' | 'both' | 'none' | 'noplacement') => void;
  salaryPercentFilter: number | null;
  setSalaryPercentFilter: (percent: number | null) => void;
  sortField: string;
  setSortField: (field: 'name' | 'cgpa' | 'branch' | 'salary') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  children: React.ReactNode;
}

export function FilterControls({
  branches,
  minCGPA,
  maxCGPA,
  minSalary,
  maxSalary,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  branchFilter,
  setBranchFilter,
  cgpaFilter,
  setCgpaFilter,
  salaryFilter,
  setSalaryFilter,
  internFilter,
  setInternFilter,
  salaryPercentFilter,
  setSalaryPercentFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  children
}: FilterControlsProps) {
  const [salaryPercentValue, setSalaryPercentValue] = useState<number>(salaryPercentFilter || 0);
  const [cgpaInputValue, setCgpaInputValue] = useState('');
  const [cgpaError, setCgpaError] = useState<string>('');
  const [salaryInputValue, setSalaryInputValue] = useState('');
  const [salaryError, setSalaryError] = useState<string>('');

  // Count active filters for badge
  const getActiveFiltersCount = () => {
    let count = 0;
    if (branchFilter !== 'all') count++;
    if (cgpaFilter !== null) count++;
    if (salaryFilter !== null) count++;
    if (internFilter !== 'all') count++;
    if (salaryPercentFilter !== null) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Clear all filters function
  const clearAllFilters = () => {
    setBranchFilter('all');
    setCgpaFilter(null);
    setSalaryFilter(null);
    setInternFilter('all');
    setSalaryPercentFilter(null);
    setSalaryPercentValue(0);
    setCgpaInputValue('');
    setSalaryInputValue('');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        {/* Header with tabs and search - responsive layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Tab list - vertical on mobile, horizontal on desktop */}
          <div className="w-full sm:w-auto">
            <TabsList className="flex sm:inline-flex flex-col sm:flex-row w-full sm:w-auto p-1.5 bg-gray-100/80 rounded-xl backdrop-blur-sm shadow-inner">
              <TabsTrigger
                value="all"
                className="w-full justify-start mb-2 sm:mb-0 sm:mr-1.5 px-4 py-2.5 text-sm rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-gray-900 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
              >
                All Students
              </TabsTrigger>
              <TabsTrigger
                value="placed"
                className="w-full justify-start mb-2 sm:mb-0 sm:mr-1.5 px-4 py-2.5 text-sm rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-green-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
              >
                Placed
              </TabsTrigger>
              <TabsTrigger
                value="unplaced"
                className="w-full justify-start mb-2 sm:mb-0 sm:mr-1.5 px-4 py-2.5 text-sm rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-amber-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
              >
                Unplaced
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="w-full justify-start mb-2 sm:mb-0 sm:mr-1.5 px-4 py-2.5 text-sm rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-blue-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="w-full justify-start mb-2 sm:mb-0 sm:mr-1.5 px-4 py-2.5 text-sm rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-red-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
              >
                Inactive
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search input with increased top margin on mobile */}
          <div className="flex-grow mt-2 sm:mt-0 sm:flex-grow-0 sm:min-w-[200px] md:min-w-[250px] xl:min-w-[300px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Search students..."
                className="pl-10 w-full h-10 bg-white/80 border-0 rounded-xl shadow-sm ring-1 ring-gray-200/50 focus-visible:ring-2 focus-visible:ring-gray-300 transition-shadow text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter controls section - with mobile optimization */}
        <div className="block sm:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-0 bg-white shadow-sm ring-1 ring-gray-200 hover:ring-gray-300 transition-all justify-between"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Filters & Sort</span>
                </div>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">{activeFiltersCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl border-t-0 px-4 py-6 bg-white/95 backdrop-blur-md">
              <SheetHeader className="mb-4">
                <SheetTitle>Filter & Sort Students</SheetTitle>
                <SheetDescription>
                  Apply filters or sort the student list
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 max-h-[calc(80vh-180px)] overflow-y-auto px-1 py-2">
                {/* Mobile Filter Controls */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Branch</h3>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-lg bg-white/95">
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Placement Type</h3>
                  <Select
                    value={internFilter}
                    onValueChange={(value) => setInternFilter(value as any)}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200">
                      <SelectValue placeholder="Placement Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-lg bg-white/95">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="intern">Internship Only</SelectItem>
                      <SelectItem value="fte">Full-Time Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="none">Not Placed (No FTE)</SelectItem>
                      <SelectItem value="noplacement">No Placement At All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">CGPA Filter</h3>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min={minCGPA}
                      max={maxCGPA}
                      step="0.1"
                      value={cgpaInputValue}
                      onChange={(e) => setCgpaInputValue(e.target.value)}
                      placeholder="Enter CGPA (0-10)"
                      className="h-10 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200"
                    />
                    {cgpaError && <p className="text-xs text-red-500">{cgpaError}</p>}
                    <Button
                      onClick={() => {
                        const parsed = parseFloat(cgpaInputValue.trim());
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
                          setCgpaFilter(parsed);
                          setCgpaError('');
                        } else {
                          setCgpaError('Enter a value between 0 and 10');
                        }
                      }}
                      className="w-full rounded-xl h-9"
                    >
                      {cgpaFilter ? 'Update' : 'Apply'} CGPA Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Salary Filter</h3>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min={minSalary}
                      max={maxSalary}
                      value={salaryInputValue}
                      onChange={(e) => setSalaryInputValue(e.target.value)}
                      placeholder={`Enter salary (${minSalary}L - ${maxSalary}L)`}
                      className="h-10 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200"
                    />
                    {salaryError && <p className="text-xs text-red-500">{salaryError}</p>}
                    <Button
                      onClick={() => {
                        const parsed = parseFloat(salaryInputValue.trim());
                        if (!isNaN(parsed) && parsed >= minSalary && parsed <= maxSalary) {
                          setSalaryFilter(parsed);
                          setSalaryError('');
                        } else {
                          setSalaryError(`Enter a valid salary between ${minSalary}L and ${maxSalary}L`);
                        }
                      }}
                      className="w-full rounded-xl h-9"
                    >
                      {salaryFilter ? 'Update' : 'Apply'} Salary Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Sort By</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={sortField === 'name' && sortDirection === 'asc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('name'); setSortDirection('asc'); }}
                      className="rounded-xl h-9"
                    >
                      Name (A-Z)
                    </Button>
                    <Button
                      variant={sortField === 'name' && sortDirection === 'desc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('name'); setSortDirection('desc'); }}
                      className="rounded-xl h-9"
                    >
                      Name (Z-A)
                    </Button>
                    <Button
                      variant={sortField === 'cgpa' && sortDirection === 'desc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('cgpa'); setSortDirection('desc'); }}
                      className="rounded-xl h-9"
                    >
                      CGPA (High-Low)
                    </Button>
                    <Button
                      variant={sortField === 'cgpa' && sortDirection === 'asc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('cgpa'); setSortDirection('asc'); }}
                      className="rounded-xl h-9"
                    >
                      CGPA (Low-High)
                    </Button>
                    <Button
                      variant={sortField === 'salary' && sortDirection === 'desc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('salary'); setSortDirection('desc'); }}
                      className="rounded-xl h-9"
                    >
                      Salary (High-Low)
                    </Button>
                    <Button
                      variant={sortField === 'salary' && sortDirection === 'asc' ? 'default' : 'outline'}
                      onClick={() => { setSortField('salary'); setSortDirection('asc'); }}
                      className="rounded-xl h-9"
                    >
                      Salary (Low-High)
                    </Button>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t border-gray-100 pt-4 mt-6 flex flex-row justify-between">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="rounded-xl border border-gray-200"
                >
                  Clear All
                </Button>
                <SheetClose asChild>
                  <Button className="rounded-xl">Apply & Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filter Controls - hidden on mobile */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 lg:gap-3 p-3 sm:p-4 lg:p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-gray-100 mb-6">
          {/* Branch Filter - responsive width */}
          <div className="w-[calc(50%-4px)] sm:w-[140px] md:w-[160px] lg:w-[180px]">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-300 transition-all text-gray-700">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent className="rounded-xl overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm text-gray-700">
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CGPA Filter - responsive width */}
          <div className="w-[calc(50%-4px)] sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full sm:w-auto h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 
                  ${cgpaFilter ? 'bg-gray-100/70 text-gray-900 font-medium' : 'bg-white text-gray-700 hover:text-gray-700'}
                  shadow-sm transition-all duration-200`}
                >
                  <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                  {cgpaFilter ? `CGPA: ≥ ${cgpaFilter}` : 'CGPA Filter'}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0 rounded-xl border-0 overflow-hidden shadow-lg bg-white/95 backdrop-blur-md transition-all duration-200">
                <div className="p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Filter by CGPA</h4>

                  {/* Manual CGPA Input with proper validation */}
                  <div className="space-y-3">
                    <div className="pt-2">
                      <label className="text-sm text-gray-700 font-medium mb-1 block">Enter CGPA value</label>
                      <Input
                        type="number"
                        min={minCGPA}
                        max={maxCGPA}
                        step="0.1"
                        value={cgpaInputValue}
                        onChange={(e) => setCgpaInputValue(e.target.value)}
                        placeholder="Enter value (0-10)"
                        className={`h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:!ring-1 focus:ring-gray-300 text-gray-700 ${cgpaError ? 'ring-red-500' : 'focus:ring-gray-300'}`}
                      />
                      {cgpaError && <p className="text-xs text-red-500 mt-1">{cgpaError}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCgpaFilter(null);
                        setCgpaError('');
                        document.body.click();
                      }}
                      className="rounded-xl border-0 ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => {
                        {
                          const parsed = parseFloat(cgpaInputValue.trim());
                          if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
                            setCgpaFilter(parsed);
                            setCgpaError('');
                          } else {
                            setCgpaError('Enter a value between 0 and 10');
                          }
                        }
                        document.body.click(); // Close popover on Apply
                      }}
                      className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Salary Filter - responsive width */}
          <div className="w-[calc(50%-4px)] sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full sm:w-auto h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 
                  ${salaryFilter ? 'bg-gray-100/70 text-gray-900 font-medium' : 'bg-white text-gray-700 hover:text-gray-700 '}
                  shadow-sm transition-all duration-200`}
                >
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  {salaryFilter ? `Salary: ≥ ${salaryFilter}L` : 'Salary Filter'}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0 rounded-xl border-0 overflow-hidden shadow-lg bg-white/95 backdrop-blur-md">
                <div className="p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Filter by Salary Package</h4>

                  <div className="space-y-3">
                    <div className="pt-2">
                      <label className="text-sm text-gray-700 font-medium mb-1 block">Enter salary value</label>
                      <Input
                        type="number"
                        min={minSalary}
                        max={maxSalary}
                        value={salaryInputValue}
                        onChange={(e) => setSalaryInputValue(e.target.value)}
                        placeholder={`Enter salary (${minSalary}L - ${maxSalary}L)`}
                        className={`h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:!ring-1 focus:ring-gray-300 text-gray-700 ${salaryError ? 'ring-red-500' : 'focus:ring-gray-300'}`}
                      />
                      {salaryError && <p className="text-xs text-red-500 mt-1">{salaryError}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSalaryFilter(null);
                        setSalaryInputValue('');
                        setSalaryError('');
                        document.body.click();
                      }}
                      className="rounded-xl border-0 ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => {
                        const parsed = parseFloat(salaryInputValue.trim());
                        if (!isNaN(parsed) && parsed >= minSalary && parsed <= maxSalary) {
                          setSalaryFilter(parsed);
                          setSalaryError('');
                        } else {
                          setSalaryError(`Enter a valid salary between ${minSalary}L and ${maxSalary}L`);
                        }
                        document.body.click();
                      }}
                      className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Placement Type Filter - responsive width */}
          <div className="w-[calc(50%-4px)] sm:w-[140px] md:w-[160px] lg:w-[180px]">
            <Select
              value={internFilter}
              onValueChange={(value: string) => setInternFilter(value as "all" | "intern" | "fte" | "both" | "none" | "noplacement")}>
              <SelectTrigger className="h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-300 transition-all text-gray-700">
                <SelectValue placeholder="Placement Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm text-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="intern">Internship</SelectItem>
                <SelectItem value="fte">Full-Time</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="none">No FTE</SelectItem>
                <SelectItem value="noplacement">Not Placed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting - grows to fill space on large screens */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 bg-white shadow-sm transition-all duration-200 text-gray-700 hover:text-gray-700"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="hidden sm:inline-block">Sort:</span> {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
                  {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[180px] p-1 rounded-xl border-0 shadow-lg bg-white/95 backdrop-blur-md"
              >
                <DropdownMenuLabel className="px-3 py-2 text-gray-600 text-xs font-medium">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem
                  onClick={() => { setSortField('name'); setSortDirection('asc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('name'); setSortDirection('desc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('cgpa'); setSortDirection('desc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  CGPA (Highest first)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('cgpa'); setSortDirection('asc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  CGPA (Lowest first)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('branch'); setSortDirection('asc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  Branch (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('salary'); setSortDirection('desc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  Salary (Highest first)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setSortField('salary'); setSortDirection('asc'); }}
                  className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
                >
                  Salary (Lowest first)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear all filters button - only shown when filters are active */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 ml-1 lg:ml-2 rounded-xl border-0 ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 bg-white text-gray-700"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Render children (table content) */}
        <div className="transition-all duration-300">
          {children}
        </div>
      </Tabs>
    </div>
  );
}
