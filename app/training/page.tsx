import { Metadata } from &quot;next&quot;;
import {
  GraduationCap,
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Star,
  Download,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;

export const metadata: Metadata = {
  title: &quot;Training | Rishi Workforce Management&quot;,
  description: &quot;Access training materials and track your learning progress&quot;,
};

const requiredTraining = [
  {
    id: 1,
    title: &quot;Brand Guidelines Fundamentals&quot;,
    description: &quot;Learn the core brand guidelines and representation standards&quot;,
    duration: &quot;45 min&quot;,
    progress: 100,
    status: &quot;completed&quot;,
    dueDate: &quot;2025-06-20&quot;,
    certificate: true,
  },
  {
    id: 2,
    title: &quot;Product Knowledge Training&quot;,
    description: &quot;Comprehensive training on TechHub Events product lineup&quot;,
    duration: &quot;60 min&quot;,
    progress: 65,
    status: &quot;in_progress&quot;,
    dueDate: &quot;2025-06-18&quot;,
    certificate: false,
  },
  {
    id: 3,
    title: &quot;Safety & Compliance&quot;,
    description: &quot;Workplace safety and compliance requirements&quot;,
    duration: &quot;30 min&quot;,
    progress: 0,
    status: &quot;not_started&quot;,
    dueDate: &quot;2025-06-25&quot;,
    certificate: true,
  },
];

const optionalTraining = [
  {
    id: 4,
    title: &quot;Advanced Customer Engagement&quot;,
    description: &quot;Master advanced techniques for customer interaction&quot;,
    duration: &quot;90 min&quot;,
    progress: 0,
    status: &quot;available&quot;,
    category: &quot;soft_skills&quot;,
  },
  {
    id: 5,
    title: &quot;Event Setup & Logistics&quot;,
    description: &quot;Learn efficient event setup and breakdown procedures&quot;,
    duration: &quot;75 min&quot;,
    progress: 30,
    status: &quot;in_progress&quot;,
    category: &quot;technical&quot;,
  },
  {
    id: 6,
    title: &quot;Social Media Best Practices&quot;,
    description: &quot;Guidelines for representing brands on social platforms&quot;,
    duration: &quot;40 min&quot;,
    progress: 100,
    status: &quot;completed&quot;,
    category: &quot;digital&quot;,
  },
];

const certifications = [
  {
    id: 1,
    name: &quot;Brand Ambassador Certification&quot;,
    earnedDate: &quot;2025-06-15&quot;,
    expiryDate: &quot;2026-06-15&quot;,
    status: &quot;active&quot;,
  },
  {
    id: 2,
    name: &quot;Product Specialist Certification&quot;,
    earnedDate: null,
    expiryDate: null,
    status: &quot;pending&quot;,
    requirements: &quot;Complete Product Knowledge Training&quot;,
  },
];

export default function TrainingPage() {
  const completedTraining = [...requiredTraining, ...optionalTraining].filter(
    (t) => t.status === &quot;completed&quot;,
  );
  const overallProgress = Math.round(
    (completedTraining.length /
      (requiredTraining.length + optionalTraining.length)) *
      100,
  );

  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Training</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Access training materials and track your learning progress
          </p>
        </div>
        <Button>
          <BookOpen className=&quot;h-4 w-4 mr-2&quot; />
          Browse Catalog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Overall Progress
            </CardTitle>
            <GraduationCap className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{overallProgress}%</div>
            <Progress value={overallProgress} className=&quot;mt-2&quot; />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Completed</CardTitle>
            <CheckCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{completedTraining.length}</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Training modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Due Soon</CardTitle>
            <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>1</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Training due this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Certifications
            </CardTitle>
            <Award className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>1</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Active certifications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue=&quot;required&quot; className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;required&quot;>Required Training</TabsTrigger>
          <TabsTrigger value=&quot;optional&quot;>Optional Training</TabsTrigger>
          <TabsTrigger value=&quot;certifications&quot;>Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;required&quot; className=&quot;space-y-4&quot;>
          <h2 className=&quot;text-xl font-semibold&quot;>Required Training</h2>
          <div className=&quot;grid gap-4&quot;>
            {requiredTraining.map((training) => (
              <Card
                key={training.id}
                className=&quot;hover:shadow-md transition-shadow&quot;
              >
                <CardContent className=&quot;p-6&quot;>
                  <div className=&quot;flex items-start justify-between&quot;>
                    <div className=&quot;flex-1 space-y-3&quot;>
                      <div className=&quot;flex items-center justify-between&quot;>
                        <h3 className=&quot;font-semibold&quot;>{training.title}</h3>
                        <Badge
                          variant={
                            training.status === &quot;completed&quot;
                              ? &quot;default&quot;
                              : training.status === &quot;in_progress&quot;
                                ? &quot;secondary&quot;
                                : &quot;outline&quot;
                          }
                        >
                          {training.status.replace(&quot;_&quot;, &quot; &quot;)}
                        </Badge>
                      </div>

                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {training.description}
                      </p>

                      <div className=&quot;flex items-center space-x-4 text-sm text-muted-foreground&quot;>
                        <div className=&quot;flex items-center&quot;>
                          <Clock className=&quot;h-4 w-4 mr-1&quot; />
                          {training.duration}
                        </div>
                        <div>Due: {training.dueDate}</div>
                        {training.certificate && (
                          <div className=&quot;flex items-center&quot;>
                            <Award className=&quot;h-4 w-4 mr-1&quot; />
                            Certificate available
                          </div>
                        )}
                      </div>

                      <div className=&quot;space-y-2&quot;>
                        <div className=&quot;flex justify-between text-sm&quot;>
                          <span>Progress</span>
                          <span>{training.progress}%</span>
                        </div>
                        <Progress value={training.progress} />
                      </div>

                      <div className=&quot;flex gap-2 pt-2&quot;>
                        {training.status === &quot;completed&quot; ? (
                          <>
                            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                              <CheckCircle className=&quot;h-4 w-4 mr-2&quot; />
                              Completed
                            </Button>
                            {training.certificate && (
                              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                                <Download className=&quot;h-4 w-4 mr-2&quot; />
                                Certificate
                              </Button>
                            )}
                          </>
                        ) : training.status === &quot;in_progress&quot; ? (
                          <Button size=&quot;sm&quot;>
                            <Play className=&quot;h-4 w-4 mr-2&quot; />
                            Continue
                          </Button>
                        ) : (
                          <Button size=&quot;sm&quot;>
                            <Play className=&quot;h-4 w-4 mr-2&quot; />
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

        <TabsContent value=&quot;optional&quot; className=&quot;space-y-4&quot;>
          <h2 className=&quot;text-xl font-semibold&quot;>Optional Training</h2>
          <div className=&quot;grid gap-4&quot;>
            {optionalTraining.map((training) => (
              <Card
                key={training.id}
                className=&quot;hover:shadow-md transition-shadow&quot;
              >
                <CardContent className=&quot;p-6&quot;>
                  <div className=&quot;flex items-start justify-between&quot;>
                    <div className=&quot;flex-1 space-y-3&quot;>
                      <div className=&quot;flex items-center justify-between&quot;>
                        <h3 className=&quot;font-semibold&quot;>{training.title}</h3>
                        <div className=&quot;flex items-center space-x-2&quot;>
                          <Badge variant=&quot;outline&quot;>
                            {training.category?.replace(&quot;_&quot;, &quot; &quot;)}
                          </Badge>
                          <Badge
                            variant={
                              training.status === &quot;completed&quot;
                                ? &quot;default&quot;
                                : training.status === &quot;in_progress&quot;
                                  ? &quot;secondary&quot;
                                  : &quot;outline&quot;
                            }
                          >
                            {training.status.replace(&quot;_&quot;, &quot; &quot;)}
                          </Badge>
                        </div>
                      </div>

                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {training.description}
                      </p>

                      <div className=&quot;flex items-center space-x-4 text-sm text-muted-foreground&quot;>
                        <div className=&quot;flex items-center&quot;>
                          <Clock className=&quot;h-4 w-4 mr-1&quot; />
                          {training.duration}
                        </div>
                      </div>

                      {training.progress > 0 && (
                        <div className=&quot;space-y-2&quot;>
                          <div className=&quot;flex justify-between text-sm&quot;>
                            <span>Progress</span>
                            <span>{training.progress}%</span>
                          </div>
                          <Progress value={training.progress} />
                        </div>
                      )}

                      <div className=&quot;flex gap-2 pt-2&quot;>
                        {training.status === &quot;completed&quot; ? (
                          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                            <CheckCircle className=&quot;h-4 w-4 mr-2&quot; />
                            Completed
                          </Button>
                        ) : training.status === &quot;in_progress&quot; ? (
                          <Button size=&quot;sm&quot;>
                            <Play className=&quot;h-4 w-4 mr-2&quot; />
                            Continue
                          </Button>
                        ) : (
                          <Button size=&quot;sm&quot;>
                            <Play className=&quot;h-4 w-4 mr-2&quot; />
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

        <TabsContent value=&quot;certifications&quot; className=&quot;space-y-4&quot;>
          <h2 className=&quot;text-xl font-semibold&quot;>Certifications</h2>
          <div className=&quot;grid gap-4&quot;>
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className=&quot;p-6&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center space-x-4&quot;>
                      <Award className=&quot;h-8 w-8 text-yellow-500&quot; />
                      <div>
                        <h3 className=&quot;font-semibold&quot;>{cert.name}</h3>
                        {cert.status === &quot;active&quot; ? (
                          <div className=&quot;text-sm text-muted-foreground&quot;>
                            Earned: {cert.earnedDate} • Expires:{&quot; &quot;}
                            {cert.expiryDate}
                          </div>
                        ) : (
                          <div className=&quot;text-sm text-muted-foreground&quot;>
                            Requirements: {cert.requirements}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Badge
                        variant={
                          cert.status === &quot;active&quot; ? &quot;default&quot; : &quot;secondary&quot;
                        }
                      >
                        {cert.status}
                      </Badge>
                      {cert.status === &quot;active&quot; && (
                        <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                          <Download className=&quot;h-4 w-4 mr-2&quot; />
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
