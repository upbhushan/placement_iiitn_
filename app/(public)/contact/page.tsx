"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Your message has been sent successfully!");
      
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="py-16 bg-gradient-to-b from-background to-background/80">
      <div className="container max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about IIIT Nagpur's placement process? We're here to help you navigate your career journey.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <h2 className="font-semibold text-xl mb-6">Contact Information</h2>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">placements@iiitn.ac.in</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">+91 712 2985010</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium">Survey No. 140,141/1 behind Br. Sheshrao Wankhade Shetkari Soot Girni, Village - Waranga, PO - Dongargaon (Butibori), Tahsil - Nagpur (Rural), District - Nagpur, Maharashtra - 441108</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-3">Office Hours</h3>
                <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
              </div>
            </div>
            
            {/* Map or additional information */}
            <div className="bg-card rounded-xl overflow-hidden border shadow-sm">
              <div className="aspect-video w-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3722.7727599554095!2d79.0285!3d21.0915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0529518230f%3A0x45b76be0621cbb88!2sIIIT%20Nagpur!5e0!3m2!1sen!2sin!4v1652530956167!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale"
                ></iframe>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="border shadow-md">
              {isSubmitted ? (
                <CardContent className="pt-10 pb-10">
                  <div className="text-center space-y-6 max-w-md mx-auto">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for contacting the IIIT Nagpur Placement Cell. We'll get back to you as soon as possible.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Send us a message</CardTitle>
                    <CardDescription>
                      Please fill out the form below and a member of our team will get back to you shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">Name</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name" 
                        className="h-12"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address" 
                        className="h-12"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-medium">Message</Label>
                      <Textarea 
                        id="message" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help you with your placement journey?" 
                        rows={5} 
                        className="resize-none"
                        required 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}