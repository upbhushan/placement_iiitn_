import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Student } from '@/lib/db/models/student';
import { Admin } from '@/lib/db/models/admin';

export const dynamic = 'force-dynamic'; // Don't cache this route

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric');
  
  try {
    await connectToDatabase();
    
    switch (metric) {
      case 'studentCount': {
        const count = await Student.countDocuments();
        // You could calculate trend by comparing to previous periods
        // For demo purposes, we'll use a static trend
        return NextResponse.json({ 
          count,
          trend: { value: 5.2, label: 'from last month' }
        });
      }
      
      case 'placedCount': {
        const count = await Student.countDocuments({ 'placement.placed': true });
        return NextResponse.json({ 
          count,
          trend: { value: 12.5, label: 'from last month' }
        });
      }
      
      case 'placementRate': {
        const totalCount = await Student.countDocuments();
        const placedCount = await Student.countDocuments({ 'placement.placed': true });
        const rate = totalCount > 0 ? parseFloat(((placedCount / totalCount) * 100).toFixed(1)) : 0;
        
        return NextResponse.json({ 
          rate,
          trend: { value: 3.8, label: 'from last year' }
        });
      }
      
      case 'adminCount': {
        const count = await Admin.countDocuments({ accountStatus: 'active' });
        return NextResponse.json({ count });
      }
      
      case 'branchDistribution': {
        const totalStudents = await Student.countDocuments();
        const branchData = await Student.aggregate([
          { $group: { _id: '$branch', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        
        const branches = branchData.map(item => ({
          name: item._id,
          count: item.count,
          percentage: Math.round((item.count / totalStudents) * 100)
        }));
        
        return NextResponse.json({ branches });
      }
      
      case 'placementCompanies': {
        const companyData = await Student.aggregate([
          { $match: { 'placement.placed': true, 'placement.company': { $exists: true, $ne: '' } } },
          { $group: { 
              _id: '$placement.company', 
              count: { $sum: 1 },
              avgPackage: { $avg: '$placement.package' }
            } 
          },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        
        const companies = companyData.map(item => ({
          name: item._id,
          count: item.count,
          avgPackage: item.avgPackage
        }));
        
        return NextResponse.json({ companies });
      }
      
      case 'recentStudents': {
        const students = await Student.find({})
          .select('name email branch cgpa placement')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
          
        return NextResponse.json({ 
          students: JSON.parse(JSON.stringify(students)) 
        });
      }
      
      case 'all': {
        // Fetch all dashboard metrics at once for a single API call
        const [
          totalStudents,
          placedStudents,
          activeAdmins,
          branchData,
          companyData,
          recentStudents
        ] = await Promise.all([
          Student.countDocuments(),
          Student.countDocuments({ 'placement.placed': true }),
          Admin.countDocuments({ accountStatus: 'active' }),
          Student.aggregate([
            { $group: { _id: '$branch', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          Student.aggregate([
            { $match: { 'placement.placed': true, 'placement.company': { $exists: true, $ne: '' } } },
            { $group: { 
                _id: '$placement.company', 
                count: { $sum: 1 },
                avgPackage: { $avg: '$placement.package' }
              } 
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]),
          Student.find({})
            .select('name email branch cgpa placement')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        ]);
        
        const placementRate = totalStudents > 0 
          ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(1)) 
          : 0;
          
        const branches = branchData.map(item => ({
          name: item._id,
          count: item.count,
          percentage: Math.round((item.count / totalStudents) * 100)
        }));
        
        const companies = companyData.map(item => ({
          name: item._id,
          count: item.count,
          avgPackage: item.avgPackage
        }));
        
        return NextResponse.json({
          studentCount: {
            count: totalStudents,
            trend: { value: 5.2, label: 'from last month' }
          },
          placedCount: {
            count: placedStudents,
            trend: { value: 12.5, label: 'from last month' }
          },
          placementRate: {
            rate: placementRate,
            trend: { value: 3.8, label: 'from last year' }
          },
          adminCount: {
            count: activeAdmins
          },
          branches,
          companies,
          students: JSON.parse(JSON.stringify(recentStudents))
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid metric specified' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}