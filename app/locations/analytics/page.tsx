&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from &quot;recharts&quot;;

// Sample location analytics data
const locationSubmissionData = [
  { month: &quot;Jan&quot;, submissions: 65, approvals: 43, rejections: 22 },
  { month: &quot;Feb&quot;, submissions: 78, approvals: 52, rejections: 26 },
  { month: &quot;Mar&quot;, submissions: 91, approvals: 73, rejections: 18 },
  { month: &quot;Apr&quot;, submissions: 125, approvals: 101, rejections: 24 },
  { month: &quot;May&quot;, submissions: 131, approvals: 114, rejections: 17 },
  { month: &quot;Jun&quot;, submissions: 142, approvals: 122, rejections: 20 },
];

const locationTypeData = [
  { name: &quot;Dispensary&quot;, value: 68 },
  { name: &quot;Event Space&quot;, value: 14 },
  { name: &quot;Consumption Lounge&quot;, value: 8 },
  { name: &quot;Distribution Center&quot;, value: 6 },
  { name: &quot;Manufacturing Facility&quot;, value: 4 },
];

const regionData = [
  { name: &quot;California&quot;, locations: 120 },
  { name: &quot;Colorado&quot;, locations: 85 },
  { name: &quot;Washington&quot;, locations: 72 },
  { name: &quot;Nevada&quot;, locations: 65 },
  { name: &quot;Oregon&quot;, locations: 60 },
  { name: &quot;Massachusetts&quot;, locations: 40 },
  { name: &quot;Illinois&quot;, locations: 38 },
  { name: &quot;Michigan&quot;, locations: 35 },
  { name: &quot;Arizona&quot;, locations: 30 },
  { name: &quot;New York&quot;, locations: 25 },
];

const COLORS = [&quot;#0088FE&quot;, &quot;#00C49F&quot;, &quot;#FFBB28&quot;, &quot;#FF8042&quot;, &quot;#8884d8&quot;];

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin((-midAngle * Math.PI) / 180);
  const cos = Math.cos((-midAngle * Math.PI) / 180);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? &quot;start&quot; : &quot;end&quot;;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor=&quot;middle&quot; fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill=&quot;none&quot;
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke=&quot;none&quot; />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill=&quot;#333&quot;
      >{`${value} locations`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill=&quot;#999&quot;
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function LocationAnalyticsPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className=&quot;container space-y-8 p-8&quot;>
      <div>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Location Analytics
        </h1>
        <p className=&quot;text-muted-foreground mt-2&quot;>
          Comprehensive analytics and insights on location management across the
          platform.
        </p>
      </div>

      <Tabs defaultValue=&quot;overview&quot; className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;submissions&quot;>Submissions</TabsTrigger>
          <TabsTrigger value=&quot;regional&quot;>Regional</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;overview&quot; className=&quot;space-y-4&quot;>
          <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-3&quot;>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Total Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>532</div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  +24 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>19</div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  -3 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>86%</div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  +2% from previous quarter
                </p>
              </CardContent>
            </Card>
          </div>

          <div className=&quot;grid gap-4 md:grid-cols-2&quot;>
            <Card className=&quot;col-span-1&quot;>
              <CardHeader>
                <CardTitle>Location Types</CardTitle>
                <CardDescription>
                  Distribution of locations by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;h-80 w-full&quot;>
                  <ResponsiveContainer width=&quot;100%&quot; height=&quot;100%&quot;>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={locationTypeData}
                        cx=&quot;50%&quot;
                        cy=&quot;50%&quot;
                        innerRadius={60}
                        outerRadius={80}
                        fill=&quot;#8884d8&quot;
                        dataKey=&quot;value&quot;
                        onMouseEnter={onPieEnter}
                      >
                        {locationTypeData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className=&quot;col-span-1&quot;>
              <CardHeader>
                <CardTitle>Submission Trends</CardTitle>
                <CardDescription>
                  Monthly location submissions and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;h-80 w-full&quot;>
                  <ResponsiveContainer width=&quot;100%&quot; height=&quot;100%&quot;>
                    <LineChart
                      data={locationSubmissionData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray=&quot;3 3&quot; />
                      <XAxis dataKey=&quot;month&quot; />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type=&quot;monotone&quot;
                        dataKey=&quot;submissions&quot;
                        stroke=&quot;#8884d8&quot;
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type=&quot;monotone&quot;
                        dataKey=&quot;approvals&quot;
                        stroke=&quot;#82ca9d&quot;
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;submissions&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Submission Metrics</CardTitle>
              <CardDescription>
                Detailed breakdown of submission outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;h-96 w-full&quot;>
                <ResponsiveContainer width=&quot;100%&quot; height=&quot;100%&quot;>
                  <BarChart
                    data={locationSubmissionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray=&quot;3 3&quot; />
                    <XAxis dataKey=&quot;month&quot; />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey=&quot;submissions&quot;
                      stackId=&quot;a&quot;
                      fill=&quot;#8884d8&quot;
                      name=&quot;Total Submissions&quot;
                    />
                    <Bar
                      dataKey=&quot;approvals&quot;
                      stackId=&quot;b&quot;
                      fill=&quot;#82ca9d&quot;
                      name=&quot;Approvals&quot;
                    />
                    <Bar
                      dataKey=&quot;rejections&quot;
                      stackId=&quot;b&quot;
                      fill=&quot;#ffc658&quot;
                      name=&quot;Rejections&quot;
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className=&quot;grid gap-4 md:grid-cols-2&quot;>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Average Approval Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>1.8 days</div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  -0.3 days from previous quarter
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Common Rejection Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className=&quot;ml-2 list-disc [&>li]:mt-2&quot;>
                  <li>Incomplete information (42%)</li>
                  <li>Address verification failed (26%)</li>
                  <li>Duplicate entry (18%)</li>
                  <li>Non-compliant business (14%)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;regional&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
              <CardDescription>Location distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;h-96 w-full&quot;>
                <ResponsiveContainer width=&quot;100%&quot; height=&quot;100%&quot;>
                  <BarChart
                    layout=&quot;vertical&quot;
                    data={regionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray=&quot;3 3&quot; />
                    <XAxis type=&quot;number&quot; />
                    <YAxis dataKey=&quot;name&quot; type=&quot;category&quot; scale=&quot;band&quot; />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey=&quot;locations&quot; fill=&quot;#8884d8&quot; />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Growth</CardTitle>
              <CardDescription>Monthly growth by top regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;h-80 w-full&quot;>
                <div className=&quot;flex items-center justify-center h-full&quot;>
                  <p className=&quot;text-muted-foreground&quot;>
                    Regional growth data is being calculated. Check back soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
