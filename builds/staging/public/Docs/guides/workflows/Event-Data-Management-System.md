# Event Data Management System

## Overview

The Event Data Management System replaces the previous "Submit Reports" functionality with a comprehensive Jotform-integrated solution for collecting qualitative and quantitative event data. This system includes sophisticated photo management, approval workflows, and event-driven architecture integration.

## Core Features

### 1. Jotform Integration

- **Purpose**: Streamlined data collection for event surveys
- **Types**: Qualitative and quantitative event assessments
- **Integration**: Direct links to custom Jotform templates
- **Data Flow**: Jotform submissions → Database storage → Management review

### 2. Photo Management System

The system manages three distinct photo categories:

#### Demo Table Photos

- **Purpose**: Document product demonstration setups
- **Requirements**: Clear visibility of demo table arrangements
- **Review Criteria**: Setup compliance, product positioning, branding visibility

#### Shelf Image Photos

- **Purpose**: Capture product shelf placements and arrangements
- **Requirements**: Clear product visibility, proper lighting, shelf organization
- **Review Criteria**: Product placement accuracy, shelf compliance, visibility standards

#### Additional Images

- **Purpose**: Supplementary event documentation
- **Requirements**: Event atmosphere, crowd engagement, additional setup details
- **Review Criteria**: Event coverage completeness, quality standards

### 3. Approval Workflow System

#### Submission States

1. **Pending**: Awaiting initial submission
2. **Submitted**: Data submitted, awaiting review
3. **Under Review**: Management actively reviewing submission
4. **Approved**: Submission meets all requirements
5. **Rejected**: Submission does not meet standards
6. **Needs Revision**: Requires specific improvements

#### Review Process

- **Field Manager Review**: Primary approval authority
- **Internal Admin Oversight**: Secondary review for compliance
- **Client Manager Input**: Final approval for client-facing events
- **Approval Notes**: Detailed feedback for approved submissions
- **Rejection Reasons**: Specific improvement requirements

### 4. Database Schema Integration

#### EventDataSubmissions Table

```sql
eventDataSubmissions {
  id: uuid (primary key)
  eventId: uuid (foreign key to events)
  agentId: uuid (foreign key to users)
  organizationId: uuid (foreign key to organizations)
  status: EventDataStatus enum
  jotformSubmissionId: varchar(100)
  jotformUrl: text
  qualitativeData: jsonb
  quantitativeData: jsonb
  submittedAt: timestamp
  reviewedAt: timestamp
  reviewedBy: uuid (foreign key to users)
  approvalNotes: text
  rejectionReason: text
  dueDate: timestamp
  createdAt: timestamp (default now)
  updatedAt: timestamp (default now)
}
```

#### EventPhotos Table

```sql
eventPhotos {
  id: uuid (primary key)
  eventDataSubmissionId: uuid (foreign key to eventDataSubmissions)
  type: PhotoType enum (demo_table, shelf_image, additional_image)
  fileName: varchar(255)
  filePath: text
  fileSize: integer
  mimeType: varchar(100)
  caption: text
  metadata: jsonb (EXIF, location, etc.)
  isApproved: boolean
  approvedBy: uuid (foreign key to users)
  approvedAt: timestamp
  rejectionReason: text
  uploadedAt: timestamp (default now)
}
```

## Implementation Details

### Frontend Components

#### Event Data Page (`app/event-data/page.tsx`)

- **Comprehensive Dashboard**: Summary cards, filtering, search
- **Submission Management**: Create, view, track submissions
- **Status Tracking**: Visual indicators for all submission states
- **Approval Workflow**: Review notes, rejection reasons display
- **Photo Management**: Upload, categorize, review photos

#### Key Features

- **Real-time Status Updates**: Automatic refresh of submission states
- **Advanced Filtering**: By status, date range, agent, location
- **Search Functionality**: Full-text search across events and locations
- **Responsive Design**: Mobile-optimized interface
- **Empty State Handling**: Clear messaging for missing data

### API Integration Points

#### Event Data Endpoints

- `GET /api/event-data/submissions` - Fetch submissions with filtering
- `POST /api/event-data/submissions` - Create new submission
- `PUT /api/event-data/submissions/:id` - Update submission
- `POST /api/event-data/photos` - Upload photo attachments
- `PUT /api/event-data/photos/:id/approve` - Approve/reject photos

#### Jotform Integration

- **Webhook Configuration**: Automatic submission processing
- **Data Synchronization**: Real-time form data import
- **Custom Form Templates**: Event-specific survey configurations
- **Authentication**: Secure form access with user validation

### Event-Driven Architecture

#### Event Types

- `EventDataSubmitted`: Triggered on form completion
- `EventDataReviewed`: Triggered on management review
- `PhotoUploaded`: Triggered on photo attachment
- `PhotoApproved`: Triggered on photo approval/rejection
- `SubmissionOverdue`: Triggered on missed deadlines

#### Event Handlers

- **Notification System**: Automatic alerts for submissions and reviews
- **Deadline Management**: Automated reminders and escalations
- **Approval Workflows**: Multi-stage review process automation
- **Report Generation**: Automated summary and analytics

## User Experience Flow

### Agent Workflow

1. **Event Completion**: Agent finishes event activities
2. **Submission Creation**: Click "New Submission" to open Jotform
3. **Data Entry**: Complete qualitative and quantitative surveys
4. **Photo Upload**: Attach demo table, shelf, and additional images
5. **Submission**: Submit for management review
6. **Status Tracking**: Monitor approval progress
7. **Revision Handling**: Address feedback if revision required

### Management Workflow

1. **Review Queue**: View pending submissions dashboard
2. **Detailed Review**: Examine submission data and photos
3. **Quality Assessment**: Evaluate against standards
4. **Decision Making**: Approve, reject, or request revisions
5. **Feedback Provision**: Provide detailed notes or rejection reasons
6. **Follow-up**: Monitor revision submissions

## Quality Assurance

### Data Validation

- **Required Fields**: Mandatory submission components
- **Photo Standards**: File size, format, quality requirements
- **Content Guidelines**: Specific criteria for each photo type
- **Deadline Enforcement**: Automatic overdue flagging

### Review Standards

- **Consistency**: Standardized approval criteria
- **Documentation**: Detailed feedback requirements
- **Escalation**: Clear escalation paths for complex cases
- **Audit Trail**: Complete review history tracking

## Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Progressive photo loading for large submissions
- **Caching**: Intelligent caching of submission data
- **Compression**: Automatic photo compression for storage efficiency
- **CDN Integration**: Fast photo delivery via content delivery network

### Scalability Features

- **Batch Processing**: Efficient handling of multiple submissions
- **Database Indexing**: Optimized queries for large datasets
- **API Rate Limiting**: Controlled access to prevent overload
- **Background Processing**: Asynchronous photo processing

## Integration Points

### External Systems

- **Jotform Platform**: Primary data collection interface
- **Photo Storage**: Cloud storage for image attachments
- **Notification Services**: Email and SMS alert systems
- **Analytics Platform**: Data export for reporting

### Internal Systems

- **User Management**: Role-based access control
- **Event Management**: Direct integration with event scheduling
- **Task Management**: Automatic task creation for submissions
- **Reporting System**: Integration with business intelligence tools

## Future Enhancements

### Planned Features

- **Mobile App**: Dedicated mobile submission interface
- **Offline Capability**: Local storage for poor connectivity areas
- **Advanced Analytics**: Machine learning for pattern recognition
- **Integration Expansion**: Additional form platform support
- **Automated QA**: AI-powered photo quality assessment

### Roadmap Considerations

- **User Feedback Integration**: Continuous improvement based on usage
- **Performance Monitoring**: Real-time system health tracking
- **Security Enhancements**: Advanced data protection measures
- **Compliance Features**: Industry-specific regulatory support
