&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
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
} from &quot;lucide-react&quot;;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: &quot;common&quot; | &quot;uncommon&quot; | &quot;rare&quot; | &quot;legendary&quot;;
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
  status: &quot;active&quot; | &quot;upcoming&quot; | &quot;completed&quot;;
}

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);
  const [selectedCategory, setSelectedCategory] = useState(&quot;all&quot;);

  const achievements: Achievement[] = [
    {
      id: &quot;1&quot;,
      name: &quot;Cannabis Expert&quot;,
      description: &quot;Complete 100 product knowledge assessments&quot;,
      icon: &quot;🌿&quot;,
      category: &quot;Knowledge&quot;,
      points: 500,
      rarity: &quot;legendary&quot;,
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      unlockedDate: &quot;2025-01-10&quot;
    },
    {
      id: &quot;2&quot;,
      name: &quot;Customer Champion&quot;,
      description: &quot;Achieve 95% customer satisfaction rating&quot;,
      icon: &quot;🏆&quot;,
      category: &quot;Service&quot;,
      points: 300,
      rarity: &quot;rare&quot;,
      unlocked: true,
      progress: 95,
      maxProgress: 100,
      unlockedDate: &quot;2025-01-08&quot;
    },
    {
      id: &quot;3&quot;,
      name: &quot;Team Player&quot;,
      description: &quot;Collaborate on 50 team projects&quot;,
      icon: &quot;🤝&quot;,
      category: &quot;Collaboration&quot;,
      points: 200,
      rarity: &quot;uncommon&quot;,
      unlocked: false,
      progress: 38,
      maxProgress: 50
    },
    {
      id: &quot;4&quot;,
      name: &quot;Innovation Star&quot;,
      description: &quot;Submit 10 improvement suggestions&quot;,
      icon: &quot;💡&quot;,
      category: &quot;Innovation&quot;,
      points: 150,
      rarity: &quot;uncommon&quot;,
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: &quot;5&quot;,
      name: &quot;Sales Superstar&quot;,
      description: &quot;Exceed monthly sales target for 6 consecutive months&quot;,
      icon: &quot;💰&quot;,
      category: &quot;Sales&quot;,
      points: 750,
      rarity: &quot;legendary&quot;,
      unlocked: false,
      progress: 4,
      maxProgress: 6
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: &quot;1&quot;,
      name: &quot;Sarah Chen&quot;,
      role: &quot;Senior Brand Agent&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      points: 2850,
      rank: 1,
      previousRank: 2,
      badges: [&quot;Cannabis Expert&quot;, &quot;Customer Champion&quot;, &quot;Team Player&quot;],
      streak: 12
    },
    {
      id: &quot;2&quot;,
      name: &quot;Mike Rodriguez&quot;,
      role: &quot;Field Manager&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      points: 2720,
      rank: 2,
      previousRank: 1,
      badges: [&quot;Leadership Star&quot;, &quot;Innovation Award&quot;, &quot;Mentor&quot;],
      streak: 8
    },
    {
      id: &quot;3&quot;,
      name: &quot;Jennifer Kim&quot;,
      role: &quot;Brand Agent&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      points: 2460,
      rank: 3,
      previousRank: 4,
      badges: [&quot;Rising Star&quot;, &quot;Quick Learner&quot;, &quot;Reliable&quot;],
      streak: 15
    },
    {
      id: &quot;4&quot;,
      name: &quot;David Park&quot;,
      role: &quot;Brand Agent&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      points: 2280,
      rank: 4,
      previousRank: 3,
      badges: [&quot;Customer Focus&quot;, &quot;Team Spirit&quot;],
      streak: 6
    },
    {
      id: &quot;5&quot;,
      name: &quot;Lisa Wang&quot;,
      role: &quot;Field Manager&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      points: 2150,
      rank: 5,
      previousRank: 5,
      badges: [&quot;Problem Solver&quot;, &quot;Efficiency Expert&quot;],
      streak: 10
    }
  ];

  const challenges: Challenge[] = [
    {
      id: &quot;1&quot;,
      name: &quot;January Excellence Sprint&quot;,
      description: &quot;Complete all monthly objectives with 95% accuracy&quot;,
      icon: &quot;🎯&quot;,
      category: &quot;Performance&quot;,
      points: 400,
      startDate: &quot;2025-01-01&quot;,
      endDate: &quot;2025-01-31&quot;,
      participants: 45,
      completed: 12,
      status: &quot;active&quot;
    },
    {
      id: &quot;2&quot;,
      name: &quot;Customer Satisfaction Boost&quot;,
      description: &quot;Improve team customer satisfaction score by 10%&quot;,
      icon: &quot;😊&quot;,
      category: &quot;Service&quot;,
      points: 300,
      startDate: &quot;2025-01-15&quot;,
      endDate: &quot;2025-02-15&quot;,
      participants: 28,
      completed: 8,
      status: &quot;active&quot;
    },
    {
      id: &quot;3&quot;,
      name: &quot;Innovation Challenge&quot;,
      description: &quot;Submit creative improvement ideas for operations&quot;,
      icon: &quot;💡&quot;,
      category: &quot;Innovation&quot;,
      points: 250,
      startDate: &quot;2025-02-01&quot;,
      endDate: &quot;2025-02-28&quot;,
      participants: 0,
      completed: 0,
      status: &quot;upcoming&quot;
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case &quot;legendary&quot;: return &quot;bg-gradient-to-r from-purple-500 to-pink-500 text-white&quot;;
      case &quot;rare&quot;: return &quot;bg-gradient-to-r from-teal-500 to-purple-500 text-white&quot;;
      case &quot;uncommon&quot;: return &quot;bg-gradient-to-r from-green-500 to-teal-500 text-white&quot;;
      case &quot;common&quot;: return &quot;bg-gradient-to-r from-gray-400 to-gray-600 text-white&quot;;
      default: return &quot;bg-gray-100 text-gray-800&quot;;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className=&quot;w-5 h-5 text-yellow-500&quot; />;
      case 2: return <Medal className=&quot;w-5 h-5 text-gray-400&quot; />;
      case 3: return <Award className=&quot;w-5 h-5 text-amber-600&quot; />;
      default: return <span className=&quot;text-sm font-bold&quot;>{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return <ArrowUp className=&quot;w-4 h-4 text-green-500&quot; />;
    if (current > previous) return <ArrowDown className=&quot;w-4 h-4 text-red-500&quot; />;
    return <span className=&quot;text-gray-400&quot;>-</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;active&quot;: return &quot;bg-green-100 text-green-800&quot;;
      case &quot;upcoming&quot;: return &quot;bg-teal-100 text-teal-800&quot;;
      case &quot;completed&quot;: return &quot;bg-gray-100 text-gray-800&quot;;
      default: return &quot;bg-gray-100 text-gray-800&quot;;
    }
  };

  const filteredAchievements = selectedCategory === &quot;all&quot; 
    ? achievements 
    : achievements.filter(a => a.category.toLowerCase() === selectedCategory);

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h2 className=&quot;text-2xl font-bold text-gray-900&quot;>Gamification Hub</h2>
          <p className=&quot;text-gray-600&quot;>Achievements, leaderboards, and recognition system</p>
        </div>
        <Button className=&quot;gap-2 bg-gradient-to-r from-purple-500 to-pink-600&quot;>
          <Plus className=&quot;w-4 h-4&quot; />
          Create Challenge
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;space-y-6&quot;>
        <TabsList className=&quot;grid w-full grid-cols-4&quot;>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;achievements&quot;>Achievements</TabsTrigger>
          <TabsTrigger value=&quot;leaderboard&quot;>Leaderboard</TabsTrigger>
          <TabsTrigger value=&quot;challenges&quot;>Challenges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
          {/* Quick Stats */}
          <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
            <Card className=&quot;bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-yellow-600 mb-1&quot;>Total Points</p>
                    <p className=&quot;text-2xl font-bold text-yellow-800&quot;>12,460</p>
                  </div>
                  <Star className=&quot;w-8 h-8 text-yellow-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-purple-600 mb-1&quot;>Achievements</p>
                    <p className=&quot;text-2xl font-bold text-purple-800&quot;>8/20</p>
                  </div>
                  <Trophy className=&quot;w-8 h-8 text-purple-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-green-50 to-green-100 border-green-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-green-600 mb-1&quot;>Streak</p>
                    <p className=&quot;text-2xl font-bold text-green-800&quot;>15 days</p>
                  </div>
                  <Fire className=&quot;w-8 h-8 text-green-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-blue-600 mb-1&quot;>Rank</p>
                    <p className=&quot;text-2xl font-bold text-blue-800&quot;>#3</p>
                  </div>
                  <Medal className=&quot;w-8 h-8 text-blue-500&quot; />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className=&quot;flex items-center gap-2&quot;>
                  <Award className=&quot;w-5 h-5&quot; />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className=&quot;flex items-center gap-3 p-3 bg-gray-50 rounded-lg&quot;>
                      <div className=&quot;text-2xl&quot;>{achievement.icon}</div>
                      <div className=&quot;flex-1&quot;>
                        <p className=&quot;font-semibold&quot;>{achievement.name}</p>
                        <p className=&quot;text-sm text-gray-600&quot;>{achievement.description}</p>
                        <div className=&quot;flex items-center gap-2 mt-1&quot;>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <span className=&quot;text-sm text-gray-500&quot;>+{achievement.points} points</span>
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
                <CardTitle className=&quot;flex items-center gap-2&quot;>
                  <Crown className=&quot;w-5 h-5&quot; />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {leaderboard.slice(0, 3).map((performer) => (
                    <div key={performer.id} className=&quot;flex items-center gap-3 p-3 bg-gray-50 rounded-lg&quot;>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <div className=&quot;w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center&quot;>
                          {getRankIcon(performer.rank)}
                        </div>
                        <Avatar className=&quot;w-10 h-10&quot;>
                          <AvatarImage src={performer.avatar} alt={performer.name} />
                          <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className=&quot;flex-1&quot;>
                        <p className=&quot;font-semibold&quot;>{performer.name}</p>
                        <p className=&quot;text-sm text-gray-600&quot;>{performer.role}</p>
                        <div className=&quot;flex items-center gap-2 mt-1&quot;>
                          <Fire className=&quot;w-4 h-4 text-orange-500&quot; />
                          <span className=&quot;text-sm text-gray-500&quot;>{performer.streak} day streak</span>
                        </div>
                      </div>
                      <div className=&quot;text-right&quot;>
                        <p className=&quot;font-bold text-lg&quot;>{performer.points.toLocaleString()}</p>
                        <div className=&quot;flex items-center gap-1&quot;>
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
        <TabsContent value=&quot;achievements&quot; className=&quot;space-y-6&quot;>
          {/* Category Filter */}
          <div className=&quot;flex gap-2 flex-wrap&quot;>
            {[&quot;all&quot;, &quot;knowledge&quot;, &quot;service&quot;, &quot;collaboration&quot;, &quot;innovation&quot;, &quot;sales&quot;].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? &quot;default&quot; : &quot;outline&quot;}
                size=&quot;sm&quot;
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all ${
                  achievement.unlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <CardContent className=&quot;p-4&quot;>
                  <div className=&quot;flex items-center justify-between mb-3&quot;>
                    <div className=&quot;text-3xl&quot;>{achievement.icon}</div>
                    {achievement.unlocked && (
                      <CheckCircle className=&quot;w-6 h-6 text-green-500&quot; />
                    )}
                  </div>
                  
                  <h3 className=&quot;font-semibold mb-2&quot;>{achievement.name}</h3>
                  <p className=&quot;text-sm text-gray-600 mb-3&quot;>{achievement.description}</p>
                  
                  <div className=&quot;space-y-2&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <span className=&quot;text-sm font-medium&quot;>+{achievement.points} points</span>
                    </div>
                    
                    {!achievement.unlocked && (
                      <div className=&quot;space-y-1&quot;>
                        <div className=&quot;flex justify-between text-sm&quot;>
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className=&quot;h-2&quot;
                        />
                      </div>
                    )}
                    
                    {achievement.unlocked && achievement.unlockedDate && (
                      <p className=&quot;text-xs text-gray-500&quot;>
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
        <TabsContent value=&quot;leaderboard&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center gap-2&quot;>
                <Trophy className=&quot;w-5 h-5&quot; />
                Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {leaderboard.map((performer) => (
                  <div key={performer.id} className=&quot;flex items-center gap-4 p-4 bg-gray-50 rounded-lg&quot;>
                    <div className=&quot;flex items-center gap-3&quot;>
                      <div className=&quot;w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center&quot;>
                        {getRankIcon(performer.rank)}
                      </div>
                      <Avatar className=&quot;w-12 h-12&quot;>
                        <AvatarImage src={performer.avatar} alt={performer.name} />
                        <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className=&quot;flex-1&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <p className=&quot;font-semibold&quot;>{performer.name}</p>
                        {getRankChange(performer.rank, performer.previousRank)}
                      </div>
                      <p className=&quot;text-sm text-gray-600&quot;>{performer.role}</p>
                      <div className=&quot;flex items-center gap-2 mt-1&quot;>
                        <Fire className=&quot;w-4 h-4 text-orange-500&quot; />
                        <span className=&quot;text-sm text-gray-500&quot;>{performer.streak} day streak</span>
                      </div>
                    </div>
                    
                    <div className=&quot;flex flex-col items-end&quot;>
                      <p className=&quot;font-bold text-xl&quot;>{performer.points.toLocaleString()}</p>
                      <p className=&quot;text-sm text-gray-500&quot;>points</p>
                    </div>
                    
                    <div className=&quot;flex flex-col gap-1&quot;>
                      {performer.badges.slice(0, 2).map((badge, i) => (
                        <Badge key={i} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
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
        <TabsContent value=&quot;challenges&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <CardTitle className=&quot;flex items-center gap-2&quot;>
                      <span className=&quot;text-xl&quot;>{challenge.icon}</span>
                      {challenge.name}
                    </CardTitle>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-4&quot;>
                    <p className=&quot;text-gray-600&quot;>{challenge.description}</p>
                    
                    <div className=&quot;grid grid-cols-2 gap-4&quot;>
                      <div>
                        <p className=&quot;text-sm text-gray-500&quot;>Participants</p>
                        <p className=&quot;font-semibold&quot;>{challenge.participants}</p>
                      </div>
                      <div>
                        <p className=&quot;text-sm text-gray-500&quot;>Completed</p>
                        <p className=&quot;font-semibold&quot;>{challenge.completed}</p>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex justify-between&quot;>
                        <span className=&quot;text-sm&quot;>Progress</span>
                        <span className=&quot;text-sm font-medium&quot;>
                          {challenge.participants > 0 ? Math.round((challenge.completed / challenge.participants) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={challenge.participants > 0 ? (challenge.completed / challenge.participants) * 100 : 0} 
                        className=&quot;h-2&quot;
                      />
                    </div>
                    
                    <div className=&quot;flex items-center justify-between&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Calendar className=&quot;w-4 h-4 text-gray-500&quot; />
                        <span className=&quot;text-sm text-gray-600&quot;>
                          {challenge.startDate} - {challenge.endDate}
                        </span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                        <span className=&quot;text-sm font-medium&quot;>+{challenge.points} points</span>
                      </div>
                    </div>
                    
                    <Button 
                      className=&quot;w-full&quot; 
                      variant={challenge.status === &quot;active&quot; ? &quot;default&quot; : &quot;outline&quot;}
                      disabled={challenge.status === &quot;completed&quot;}
                    >
                      {challenge.status === &quot;active&quot; ? &quot;Join Challenge&quot; : 
                       challenge.status === &quot;upcoming&quot; ? &quot;Coming Soon&quot; : &quot;Completed&quot;}
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