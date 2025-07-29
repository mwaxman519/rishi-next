# Frontend Component Integration

## Overview

This document details the comprehensive frontend component integration for Event Data Management and Task Management systems, including React components, state management, UI/UX patterns, and integration with the Next.js 15.3.2 architecture.

## Event Data Management Components

### Main Event Data Page Component

#### EventDataPage (`app/event-data/page.tsx`)

**Purpose**: Central dashboard for event data submission management

**Key Features**:

- Comprehensive submission overview with status cards
- Advanced filtering and search capabilities
- Tabbed interface for different submission states
- Real-time status updates and notifications
- Responsive design optimized for mobile field usage

**Component Structure**:

```typescript
interface EventDataPageProps {
  initialSubmissions?: EventDataSubmission[];
  userRole: UserRole;
  organizationId: string;
}

export default function EventDataPage({
  initialSubmissions,
  userRole,
  organizationId,
}: EventDataPageProps) {
  // State management
  const [submissions, setSubmissions] = useState<EventDataSubmission[]>(
    initialSubmissions || [],
  );
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    EventDataSubmission[]
  >([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Real-time data fetching
  useEffect(() => {
    fetchSubmissions();
  }, [organizationId, statusFilter]);

  // Advanced filtering logic
  useEffect(() => {
    applyFilters();
  }, [submissions, selectedTab, searchTerm, statusFilter]);
}
```

**State Management Pattern**:

- Local state for UI interactions and filtering
- Server state management via React Query for data fetching
- Optimistic updates for immediate user feedback
- Error boundary integration for robust error handling

### Event Data Submission Components

#### SubmissionCard Component

```typescript
interface SubmissionCardProps {
  submission: EventDataSubmission;
  onView: (submission: EventDataSubmission) => void;
  onEdit?: (submission: EventDataSubmission) => void;
  userRole: UserRole;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onView,
  onEdit,
  userRole
}) => {
  const canEdit = useMemo(() =>
    userRole === 'field_manager' ||
    userRole === 'internal_admin' ||
    (submission.status === 'needs_revision' && userRole === 'brand_agent'),
    [userRole, submission.status]
  );

  return (
    <Card className={`transition-shadow hover:shadow-md ${
      isOverdue(submission.dueDate, submission.status)
        ? 'border-l-4 border-l-red-500'
        : ''
    }`}>
      <CardContent className="p-6">
        {/* Submission details and actions */}
      </CardContent>
    </Card>
  );
};
```

#### PhotoGallery Component

```typescript
interface PhotoGalleryProps {
  photos: EventPhoto[];
  submissionId: string;
  canUpload: boolean;
  canApprove: boolean;
  onPhotoUpload: (files: File[], type: PhotoType) => Promise<void>;
  onPhotoApprove: (photoId: string, approved: boolean, reason?: string) => Promise<void>;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  submissionId,
  canUpload,
  canApprove,
  onPhotoUpload,
  onPhotoApprove
}) => {
  const [selectedType, setSelectedType] = useState<PhotoType>('demo_table');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const photosByType = useMemo(() =>
    groupBy(photos, 'type'),
    [photos]
  );

  return (
    <div className="space-y-6">
      {/* Photo type tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo_table">Demo Table</TabsTrigger>
          <TabsTrigger value="shelf_image">Shelf Images</TabsTrigger>
          <TabsTrigger value="additional_image">Additional</TabsTrigger>
        </TabsList>

        {Object.entries(photosByType).map(([type, typePhotos]) => (
          <TabsContent key={type} value={type}>
            <PhotoTypeSection
              type={type as PhotoType}
              photos={typePhotos}
              canUpload={canUpload}
              canApprove={canApprove}
              onUpload={(files) => onPhotoUpload(files, type as PhotoType)}
              onApprove={onPhotoApprove}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
```

### Jotform Integration Components

#### JotformEmbed Component

```typescript
interface JotformEmbedProps {
  formId: string;
  submissionId?: string;
  prefillData?: Record<string, any>;
  onSubmissionComplete: (submissionData: any) => void;
}

const JotformEmbed: React.FC<JotformEmbedProps> = ({
  formId,
  submissionId,
  prefillData,
  onSubmissionComplete
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Jotform communication setup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://form.jotform.com') return;

      if (event.data.type === 'form_submission') {
        setIsSubmitting(true);
        onSubmissionComplete(event.data.submission);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSubmissionComplete]);

  const jotformUrl = useMemo(() => {
    const baseUrl = `https://form.jotform.com/${formId}`;
    const params = new URLSearchParams();

    if (submissionId) params.set('submission_id', submissionId);
    if (prefillData) {
      Object.entries(prefillData).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    }

    return `${baseUrl}?${params.toString()}`;
  }, [formId, submissionId, prefillData]);

  return (
    <div className="relative w-full h-96 border rounded-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading form...</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={jotformUrl}
        className="w-full h-full"
        onLoad={() => setIsLoaded(true)}
        title="Event Data Submission Form"
      />

      {isSubmitting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm">Processing submission...</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Task Management Components

### Main Task Management Page Component

#### TaskManagementPage (`app/tasks/page.tsx`)

**Purpose**: Comprehensive task assignment and tracking interface

**Key Features**:

- Multi-role task assignment capabilities
- Advanced filtering by type, priority, status, and assigner
- Tabbed interface for different task states
- Real-time task status updates
- Bulk task operations
- Mobile-optimized responsive design

**Component Architecture**:

```typescript
interface TaskManagementPageProps {
  initialTasks?: Task[];
  userRole: UserRole;
  organizationId: string;
  canAssignTasks: boolean;
}

export default function TaskManagementPage({
  initialTasks,
  userRole,
  organizationId,
  canAssignTasks,
}: TaskManagementPageProps) {
  // Enhanced state management
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Real-time task updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/tasks`);

    ws.onmessage = (event) => {
      const { type, task } = JSON.parse(event.data);

      if (type === "task_updated") {
        setTasks((current) =>
          current.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
        );
      }
    };

    return () => ws.close();
  }, []);
}
```

### Task-Specific Components

#### TaskCard Component

```typescript
interface TaskCardProps {
  task: Task;
  userRole: UserRole;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  onView: (task: Task) => void;
  onComment: (task: Task) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userRole,
  onStatusChange,
  onView,
  onComment,
  isSelected,
  onSelect
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const canModify = useMemo(() =>
    task.assignedTo === userId ||
    task.assignedBy === userId ||
    ['internal_admin', 'field_manager'].includes(userRole),
    [task, userRole, userId]
  );

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.status === 'overdue' || isOverdue(task.dueDate)
        ? 'border-l-4 border-l-red-500'
        : ''
    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(task.id, !!checked)}
              />
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>

                <Badge className={`${getStatusColor(task.status)} flex items-center gap-1`}>
                  {getStatusIcon(task.status)}
                  {formatStatus(task.status)}
                </Badge>

                <Badge className={getTaskTypeColor(task.type)}>
                  {getTaskTypeIcon(task.type)}
                  {formatTaskType(task.type)}
                </Badge>

                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>

              <p className="text-gray-600 mb-3">{task.description}</p>

              <TaskMetadata task={task} />
            </div>
          </div>

          <TaskActions
            task={task}
            canModify={canModify}
            isUpdating={isUpdating}
            onStatusChange={handleStatusChange}
            onView={onView}
            onComment={onComment}
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

#### TaskAssignmentModal Component

```typescript
interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (taskData: CreateTaskRequest) => Promise<void>;
  organizationId: string;
  eventId?: string;
  userRole: UserRole;
}

const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  organizationId,
  eventId,
  userRole
}) => {
  const [formData, setFormData] = useState<Partial<CreateTaskRequest>>({
    type: 'event_report',
    priority: 'medium',
    organizationId,
    eventId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Fetch available users for assignment
  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen, organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAssign(formData as CreateTaskRequest);
      onClose();
      setFormData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogDescription>
            Create and assign a task to team members
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Task Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TaskType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional form fields */}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### Specialized Task Components

#### MileageSubmissionForm Component

```typescript
interface MileageSubmissionFormProps {
  taskId?: string;
  onSubmit: (data: MileageSubmissionRequest) => Promise<void>;
  onCancel: () => void;
}

const MileageSubmissionForm: React.FC<MileageSubmissionFormProps> = ({
  taskId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<MileageSubmissionRequest>({
    taskId,
    startLocation: '',
    endLocation: '',
    distance: 0,
    rate: 0.56, // Default IRS rate
    notes: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() =>
    formData.distance * formData.rate,
    [formData.distance, formData.rate]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        receiptFile,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mileage Submission</CardTitle>
        <CardDescription>
          Submit travel expenses for reimbursement
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startLocation">Start Location</Label>
              <Input
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  startLocation: e.target.value
                }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="endLocation">End Location</Label>
              <Input
                id="endLocation"
                value={formData.endLocation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endLocation: e.target.value
                }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  distance: parseFloat(e.target.value) || 0
                }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="rate">Rate ($/mile)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  rate: parseFloat(e.target.value) || 0
                }))}
                required
              />
            </div>

            <div>
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold text-green-600">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="receipt">Receipt (optional)</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Mileage'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
```

#### ClockInOutWidget Component

```typescript
interface ClockInOutWidgetProps {
  currentStatus: 'clocked_out' | 'clocked_in' | 'on_break';
  onClockEvent: (event: ClockEventRequest) => Promise<void>;
  taskId?: string;
}

const ClockInOutWidget: React.FC<ClockInOutWidgetProps> = ({
  currentStatus,
  onClockEvent,
  taskId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // Reverse geocode to get address
          reverseGeocode(position.coords.latitude, position.coords.longitude)
            .then(setLocation);
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleClockEvent = async (eventType: ClockEventType) => {
    setIsProcessing(true);

    try {
      await onClockEvent({
        eventType,
        taskId,
        location,
        coordinates,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextAction = () => {
    switch (currentStatus) {
      case 'clocked_out':
        return { type: 'clock_in', label: 'Clock In', color: 'bg-green-600' };
      case 'clocked_in':
        return { type: 'clock_out', label: 'Clock Out', color: 'bg-red-600' };
      case 'on_break':
        return { type: 'break_end', label: 'End Break', color: 'bg-blue-600' };
    }
  };

  const nextAction = getNextAction();

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Current Status</div>
          <Badge className={getStatusColor(currentStatus)} size="lg">
            {formatStatus(currentStatus)}
          </Badge>
        </div>

        {location && (
          <div className="text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 inline mr-1" />
            {location}
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={() => handleClockEvent(nextAction.type as ClockEventType)}
            disabled={isProcessing}
            className={`w-full ${nextAction.color}`}
            size="lg"
          >
            {isProcessing ? 'Processing...' : nextAction.label}
          </Button>

          {currentStatus === 'clocked_in' && (
            <Button
              onClick={() => handleClockEvent('break_start')}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              Start Break
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## State Management Integration

### React Query Integration

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Custom hooks for data fetching
export function useEventDataSubmissions(
  organizationId: string,
  filters?: SubmissionFilters,
) {
  return useQuery({
    queryKey: ["event-data-submissions", organizationId, filters],
    queryFn: () => fetchEventDataSubmissions(organizationId, filters),
    enabled: !!organizationId,
  });
}

export function useTasks(organizationId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", organizationId, filters],
    queryFn: () => fetchTasks(organizationId, filters),
    enabled: !!organizationId,
  });
}

// Mutation hooks
export function useCreateTask() {
  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tasks"]);
      // Publish real-time event
      publishTaskEvent("task_created", data);
    },
  });
}
```

### WebSocket Integration

```typescript
// hooks/useRealTimeUpdates.ts
export function useRealTimeUpdates(organizationId: string) {
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/updates`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          organizationId,
        }),
      );
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      switch (type) {
        case "task_updated":
          queryClient.setQueryData(
            ["tasks", organizationId],
            (old: Task[] = []) =>
              old.map((task) =>
                task.id === data.id ? { ...task, ...data } : task,
              ),
          );
          break;

        case "submission_updated":
          queryClient.setQueryData(
            ["event-data-submissions", organizationId],
            (old: EventDataSubmission[] = []) =>
              old.map((sub) =>
                sub.id === data.id ? { ...sub, ...data } : sub,
              ),
          );
          break;
      }
    };

    return () => ws.close();
  }, [organizationId]);
}
```

## Mobile Optimization

### Responsive Design Patterns

```typescript
// hooks/useResponsive.ts
export function useResponsive() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

// Mobile-optimized task card
const MobileTaskCard: React.FC<TaskCardProps> = ({ task, ...props }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm">{task.title}</h3>
            <Badge size="sm" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Due: {formatDate(task.dueDate)}
            </span>
            <Button size="sm" variant="outline">
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// Lazy load heavy components
const TaskAssignmentModal = lazy(() => import('./TaskAssignmentModal'));
const PhotoGallery = lazy(() => import('./PhotoGallery'));
const JotformEmbed = lazy(() => import('./JotformEmbed'));

// Virtualized lists for large datasets
import { FixedSizeList as List } from 'react-window';

const VirtualizedTaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={200}
      className="task-list"
    >
      {Row}
    </List>
  );
};
```

### Memoization and Optimization

```typescript
// Memoized filtering
const useFilteredTasks = (tasks: Task[], filters: TaskFilters) => {
  return useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.type && task.type !== filters.type) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (
        filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tasks, filters]);
};

// Memoized components
const MemoizedTaskCard = React.memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.updatedAt === nextProps.task.updatedAt
  );
});
```

This comprehensive frontend integration ensures seamless user experience across all Event Data and Task Management features with optimal performance, responsive design, and real-time capabilities.
