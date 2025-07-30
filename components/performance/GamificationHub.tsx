"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Target, 
  Award,
  Medal,
  Gift,
  Users,
  TrendingUp,
  Calendar,
  Gamepad2,
  Sparkles,
  Fire,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  role: string;
  avatar: string;
  points: number;
  rank: number;
  previousRank: number;
  badges: string[];
  streak: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  startDate: string;
  endDate: string;
  participants: number;
  completed: number;
  status: "active" | "upcoming" | "completed";
}

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Cannabis Expert",
      description: "Complete 100 product knowledge assessments",
      icon: "🌿",
      category: "Knowledge",
      points: 500,
      rarity: "legendary",
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      unlockedDate: "2025-01-10"
    },
    {
      id: "2",
      name: "Customer Champion",
      description: "Achieve 95% customer satisfaction rating",
      icon: "🏆",
      category: "Service",
      points: 300,
      rarity: "rare",
      unlocked: true,
      progress: 95,
      maxProgress: 100,
      unlockedDate: "2025-01-08"
    },
    {
      id: "3",
      name: "Team Player",
      description: "Collaborate on 50 team projects",
      icon: "🤝",
      category: "Collaboration",
      points: 200,
      rarity: "uncommon",
      unlocked: false,
      progress: 38,
      maxProgress: 50
    },
    {
      id: "4",
      name: "Innovation Star",
      description: "Submit 10 improvement suggestions",
      icon: "💡",
      category: "Innovation",
      points: 150,
      rarity: "uncommon",
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: "5",
      name: "Sales Superstar",
      description: "Exceed monthly sales target for 6 consecutive months",
      icon: "💰",
      category: "Sales",
      points: 750,
      rarity: "legendary",
      unlocked: false,
      progress: 4,
      maxProgress: 6
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Senior Brand Agent",
      avatar: "/api/placeholder/40/40",
      points: 2850,
      rank: 1,
      previousRank: 2,
      badges: ["Cannabis Expert", "Customer Champion", "Team Player"],
      streak: 12
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      role: "Field Manager",
      avatar: "/api/placeholder/40/40",
      points: 2720,
      rank: 2,
      previousRank: 1,
      badges: ["Leadership Star", "Innovation Award", "Mentor"],
      streak: 8
    },
    {
      id: "3",
      name: "Jennifer Kim",
      role: "Brand Agent",
      avatar: "/api/placeholder/40/40",
      points: 2460,
      rank: 3,
      previousRank: 4,
      badges: ["Rising Star", "Quick Learner", "Reliable"],
      streak: 15
    },
    {
      id: "4",
      name: "David Park",
      role: "Brand Agent",
      avatar: "/api/placeholder/40/40",
      points: 2280,
      rank: 4,
      previousRank: 3,
      badges: ["Customer Focus", "Team Spirit"],
      streak: 6
    },
    {
      id: "5",
      name: "Lisa Wang",
      role: "Field Manager",
      avatar: "/api/placeholder/40/40",
      points: 2150,
      rank: 5,
      previousRank: 5,
      badges: ["Problem Solver", "Efficiency Expert"],
      streak: 10
    }
  ];

  const challenges: Challenge[] = [
    {
      id: "1",
      name: "January Excellence Sprint",
      description: "Complete all monthly objectives with 95% accuracy",
      icon: "🎯",
      category: "Performance",
      points: 400,
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      participants: 45,
      completed: 12,
      status: "active"
    },
    {
      id: "2",
      name: "Customer Satisfaction Boost",
      description: "Improve team customer satisfaction score by 10%",
      icon: "😊",
      category: "Service",
      points: 300,
      startDate: "2025-01-15",
      endDate: "2025-02-15",
      participants: 28,
      completed: 8,
      status: "active"
    },
    {
      id: "3",
      name: "Innovation Challenge",
      description: "Submit creative improvement ideas for operations",
      icon: "💡",
      category: "Innovation",
      points: 250,
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      participants: 0,
      completed: 0,
      status: "upcoming"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "rare": return "bg-gradient-to-r from-teal-500 to-purple-500 text-white";
      case "uncommon": return "bg-gradient-to-r from-green-500 to-teal-500 text-white";
      case "common": return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-bold">{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current > previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <span className="text-gray-400">-</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-teal-100 text-teal-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category.toLowerCase() === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gamification Hub</h2>
          <p className="text-gray-600">Achievements, leaderboards, and recognition system</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="w-4 h-4" />
          Create Challenge
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-yellow-800">12,460</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 mb-1">Achievements</p>
                    <p className="text-2xl font-bold text-purple-800">8/20</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Streak</p>
                    <p className="text-2xl font-bold text-green-800">15 days</p>
                  </div>
                  <Fire className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Rank</p>
                    <p className="text-2xl font-bold text-blue-800">#3</p>
                  </div>
                  <Medal className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <span className="text-sm text-gray-500">+{achievement.points} points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.slice(0, 3).map((performer) => (
                    <div key={performer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          {getRankIcon(performer.rank)}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={performer.avatar} alt={performer.name} />
                          <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Fire className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-500">{performer.streak} day streak</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{performer.points.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          {getRankChange(performer.rank, performer.previousRank)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "knowledge", "service", "collaboration", "innovation", "sales"].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all ${
                  achievement.unlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    {achievement.unlocked && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <span className="text-sm font-medium">+{achievement.points} points</span>
                    </div>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {achievement.unlocked && achievement.unlockedDate && (
                      <p className="text-xs text-gray-500">
                        Unlocked on {achievement.unlockedDate}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((performer) => (
                  <div key={performer.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        {getRankIcon(performer.rank)}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={performer.avatar} alt={performer.name} />
                        <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{performer.name}</p>
                        {getRankChange(performer.rank, performer.previousRank)}
                      </div>
                      <p className="text-sm text-gray-600">{performer.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Fire className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-500">{performer.streak} day streak</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <p className="font-bold text-xl">{performer.points.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">points</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {performer.badges.slice(0, 2).map((badge, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">{challenge.icon}</span>
                      {challenge.name}
                    </CardTitle>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{challenge.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Participants</p>
                        <p className="font-semibold">{challenge.participants}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="font-semibold">{challenge.completed}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">
                          {challenge.participants > 0 ? Math.round((challenge.completed / challenge.participants) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={challenge.participants > 0 ? (challenge.completed / challenge.participants) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {challenge.startDate} - {challenge.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">+{challenge.points} points</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={challenge.status === "active" ? "default" : "outline"}
                      disabled={challenge.status === "completed"}
                    >
                      {challenge.status === "active" ? "Join Challenge" : 
                       challenge.status === "upcoming" ? "Coming Soon" : "Completed"}
                    </Button>
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