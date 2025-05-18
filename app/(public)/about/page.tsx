import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About Our Campus Management System</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="lead">
          Our campus management system is designed to streamline administrative processes
          and enhance the educational experience for both students and administrators.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          To provide a comprehensive platform that simplifies campus operations, 
          improves communication between stakeholders, and offers valuable insights
          through data-driven analytics.
        </p>
        
        <h2>Key Features</h2>
        <ul>
          <li><strong>Student Management</strong> - Track academic progress, attendance, and personal information</li>
          <li><strong>Administrative Tools</strong> - Streamline administrative tasks and reporting</li>
          <li><strong>Placement Portal</strong> - Connect students with career opportunities</li>
          <li><strong>Analytics Dashboard</strong> - Gain insights through comprehensive data visualization</li>
        </ul>
        
        <h2>Our Team</h2>
        <p>
          Our dedicated team of developers and educators has created this platform 
          with a focus on usability, security, and modern educational needs.
        </p>
        
        <div className="my-8 flex justify-center">
          <Button asChild size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}