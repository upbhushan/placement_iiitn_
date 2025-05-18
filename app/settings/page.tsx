'use client';

import { useState } from 'react';
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Badge for future features
    const FutureBadge = () => (
        <Badge variant="outline" className="ml-2 text-xs bg-muted/50">
            <InfoIcon className="h-3 w-3 mr-1" /> Future feature
        </Badge>
    );

    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <Tabs defaultValue="appearance">
                <TabsList className="mb-4 grid w-full grid-cols-4">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Manage how the application looks and behaves.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Theme</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="animations">
                                        Enable animations
                                        <FutureBadge />
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Controls UI animations throughout the app
                                    </p>
                                </div>
                                <Switch id="animations" defaultChecked />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="density">
                                    Interface density
                                    <FutureBadge />
                                </Label>
                                <Select defaultValue="comfortable">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select density" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="compact">Compact</SelectItem>
                                        <SelectItem value="comfortable">Comfortable</SelectItem>
                                        <SelectItem value="spacious">Spacious</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>
                                Manage your account information and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="language">
                                    Language
                                    <FutureBadge />
                                </Label>
                                <Select defaultValue="en">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Language selection is planned for a future update
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">
                                    Time Zone
                                    <FutureBadge />
                                </Label>
                                <Select defaultValue="utc">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC</SelectItem>
                                        <SelectItem value="est">Eastern Time (US)</SelectItem>
                                        <SelectItem value="cst">Central Time (US)</SelectItem>
                                        <SelectItem value="ist">India Standard Time</SelectItem>
                                        <SelectItem value="jst">Japan Standard Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => toast.info("Password reset will be implemented in a future update")}
                                >
                                    Change Password
                                    <FutureBadge />
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => toast.info("Account deletion will be implemented in a future update")}
                                >
                                    Delete Account
                                    <FutureBadge />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Notification Preferences
                                <FutureBadge />
                            </CardTitle>
                            <CardDescription>
                                Control how and when you receive notifications.
                                <span className="block mt-1 text-xs">Notification preferences will be saved in a future update</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="notifications-toggle">Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable all notifications
                                    </p>
                                </div>
                                <Switch
                                    id="notifications-toggle"
                                    checked={notificationsEnabled}
                                    onCheckedChange={setNotificationsEnabled}
                                />
                            </div>

                            {notificationsEnabled && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium">Notification channels</h3>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-notifications">Email notifications</Label>
                                        <Switch id="email-notifications" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push-notifications">Push notifications</Label>
                                        <Switch id="push-notifications" defaultChecked />
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="font-medium mb-2">Notification types</h3>

                                        {['Updates', 'Security Alerts', 'Reminders', 'New Features'].map(type => (
                                            <div key={type} className="flex items-center justify-between mt-2">
                                                <Label htmlFor={`notification-${type.toLowerCase().replace(' ', '-')}`}>{type}</Label>
                                                <Switch id={`notification-${type.toLowerCase().replace(' ', '-')}`} defaultChecked />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="privacy">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Privacy & Data
                                <FutureBadge />
                            </CardTitle>
                            <CardDescription>
                                Manage your data and privacy preferences.
                                <span className="block mt-1 text-xs">Privacy settings will be functional in a future update</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="analytics">Usage Analytics</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow anonymous usage data collection
                                    </p>
                                </div>
                                <Switch id="analytics" defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="cookies">Non-essential Cookies</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow non-essential cookies for enhanced features
                                    </p>
                                </div>
                                <Switch id="cookies" defaultChecked />
                            </div>

                            <div className="pt-4 space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => toast.info("Data export will be implemented in a future update")}
                                >
                                    Export My Data
                                    <FutureBadge />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => toast.info("Cache clearing will be implemented in a future update")}
                                >
                                    Clear Cached Data
                                    <FutureBadge />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}