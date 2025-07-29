// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}

import { Metadata } from "next";
import {
  GraduationCap,
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Star,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Training | Rishi Workforce Management",
  description: "Access training materials and track your learning progress",
};

const requiredTraining = [
  {
    id: 1,
    title: "Brand Guidelines Fundamentals",
    description: "Learn the core brand guidelines and representation standards",
    duration: "45 min",
    progress: 100,
    status: "completed",
    dueDate: "2025-06-20",
    certificate: true,
  },
  {
    id: 2,
    title: "Product Knowledge Training",
    description: "Comprehensive training on TechHub Events product lineup",
    duration: "60 min",
    progress: 65,
    status: "in_progress",
    dueDate: "2025-06-18",
    certificate: false,
  },
  {
    id: 3,
    title: "Safety & Compliance",
    description: "Workplace safety and compliance requirements",
    duration: "30 min",
    progress: 0,
    status: "not_started",
    dueDate: "2025-06-25",
    certificate: true,
  },
];

const optionalTraining = [
  {
    id: 4,
    title: "Advanced Customer Engagement",
    description: "Master advanced techniques for customer interaction",
    duration: "90 min",
    progress: 0,
    status: "available",
    category: "soft_skills",
  },
  {
    id: 5,
    title: "Event Setup & Logistics",
    description: "Learn efficient event setup and breakdown procedures",
    duration: "75 min",
    progress: 30,
    status: "in_progress",
    category: "technical",
  },
  {
    id: 6,
    title: "Social Media Best Practices",
    description: "Guidelines for representing brands on social platforms",
    duration: "40 min",
    progress: 100,
    status: "completed",
    category: "digital",
  },
];

const certifications = [
  {
    id: 1,
    name: "Brand Ambassador Certification",
    earnedDate: "2025-06-15",
    expiryDate: "2026-06-15",
    status: "active",
  },
  {
    id: 2,
    name: "Product Specialist Certification",
    earnedDate: null,
    expiryDate: null,
    status: "pending",
    requirements: "Complete Product Knowledge Training",
  },
];

export default function TrainingPage() {
  const completedTraining = [...requiredTraining, ...optionalTraining].filter(
    (t) => t.status === "completed",
  );
  const overallProgress = Math.round(
    (completedTraining.length /
      (requiredTraining.length + optionalTraining.length)) *
      100,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training</h1>
          <p className="text-muted-foreground">
            Access training materials and track your learning progress
          </p>
        </div>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Catalog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTraining.length}</div>
            <p className="text-xs text-muted-foreground">Training modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Training due this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certifications
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Active certifications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="required" className="space-y-4">
        <TabsList>
          <TabsTrigger value="required">Required Training</TabsTrigger>
          <TabsTrigger value="optional">Optional Training</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="required" className="space-y-4">
          <h2 className="text-xl font-semibold">Required Training</h2>
          <div className="grid gap-4">
            {requiredTraining.map((training) => (
              <Card
                key={training.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{training.title}</h3>
                        <Badge
                          variant={
                            training.status === "completed"
                              ? "default"
                              : training.status === "in_progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {training.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {training.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {training.duration}
                        </div>
                        <div>Due: {training.dueDate}</div>
                        {training.certificate && (
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            Certificate available
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{training.progress}%</span>
                        </div>
                        <Progress value={training.progress} />
                      </div>

                      <div className="flex gap-2 pt-2">
                        {training.status === "completed" ? (
                          <>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </Button>
                            {training.certificate && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Certificate
                              </Button>
                            )}
                          </>
                        ) : training.status === "in_progress" ? (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optional" className="space-y-4">
          <h2 className="text-xl font-semibold">Optional Training</h2>
          <div className="grid gap-4">
            {optionalTraining.map((training) => (
              <Card
                key={training.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{training.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {training.category?.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant={
                              training.status === "completed"
                                ? "default"
                                : training.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {training.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {training.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {training.duration}
                        </div>
                      </div>

                      {training.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{training.progress}%</span>
                          </div>
                          <Progress value={training.progress} />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {training.status === "completed" ? (
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </Button>
                        ) : training.status === "in_progress" ? (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <h2 className="text-xl font-semibold">Certifications</h2>
          <div className="grid gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        {cert.status === "active" ? (
                          <div className="text-sm text-muted-foreground">
                            Earned: {cert.earnedDate} • Expires:{" "}
                            {cert.expiryDate}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Requirements: {cert.requirements}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          cert.status === "active" ? "default" : "secondary"
                        }
                      >
                        {cert.status}
                      </Badge>
                      {cert.status === "active" && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
