# Mobile Application Architecture

## Overview

The mobile application is a native app for iOS and Android that connects to the Rishi platform. It provides offline capabilities for field agents working in areas with poor connectivity, while maintaining full functionality when online.

## Architecture Principles

1. **Online-First, Offline-Capable**: The application operates primarily online but provides full offline functionality when connectivity is unavailable.
2. **Shared Codebase**: Using a monorepo approach to share code with the Next.js web application where possible.
3. **Native Device Integration**: Full access to device hardware (camera, GPS, notifications) for field operations.
4. **Conflict Resolution**: Smart conflict management when syncing offline changes with the server.
5. **Progressive Enhancement**: Core features work offline, additional features available online.
6. **White-Label Support**: Design and configuration support for multiple client organizations.

## Technology Stack

### Core Technologies

- **React Native**: For cross-platform native application development
- **Expo**: SDK and toolchain for React Native development
- **TypeScript**: Type-safe application code
- **WatermelonDB**: Offline-first reactive database
- **React Navigation**: Navigation library for React Native
- **React Query**: Data fetching and state management
- **Reanimated**: React Native animations
- **Expo Secure Store**: Secure storage for authentication tokens
- **NetInfo**: Network connectivity detection and management

### Backend Integration

- **REST API**: Communication with the Rishi serverless backend
- **JWT Authentication**: Secure authentication with token management
- **Optimistic Updates**: Local updates before server confirmation
- **Batch Sync**: Efficient synchronization of multiple changes
- **Background Sync**: Automatic synchronization when connectivity is restored

## Application Structure

```
apps/mobile/
├── App.tsx             # Application entry point
├── src/
│   ├── api/            # API service layer
│   ├── components/     # Reusable UI components
│   ├── config/         # Application configuration
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── models/         # Data models and schemas
│   ├── navigation/     # Navigation structure
│   ├── providers/      # Service providers (Auth, DB, etc.)
│   ├── screens/        # Application screens
│   ├── services/       # Business logic services
│   ├── storage/        # Local storage implementation
│   ├── styles/         # Global styles and theme
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── assets/             # Static assets (images, fonts)
└── metro.config.js     # Metro bundler configuration
```

## Core Services

### Authentication Service (Implemented)

- User authentication via JWT
- Token management with Expo SecureStore
- Offline authentication with stored credentials
- Auto-refresh mechanism for expired tokens
- Session state management with React Context

```typescript
// AuthProvider.tsx (Simplified)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load stored credentials on startup
  useEffect(() => {
    const loadStoredAuthState = async () => {
      const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        }
      }
    };

    loadStoredAuthState();
  }, []);

  // Authentication methods
  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await apiService.login({ username, password });
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(response.user));
      return true;
    }
    return false;
  };

  // Provided context
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Synchronization Service (Implemented)

- Bi-directional data synchronization between WatermelonDB and PostgreSQL
- Change tracking with version and timestamp metadata
- Multiple conflict resolution strategies (server wins, client wins, merge)
- Automatic sync on connectivity changes
- Manual sync trigger with progress indicators
- Background sync scheduling

```typescript
// SyncProvider.tsx (Simplified)
export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectivityState>(ConnectivityState.OFFLINE);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.SYNCED);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        setConnectionState(ConnectivityState.ONLINE);
        if (hasUnsyncedChanges && !syncInProgress) {
          syncData();
        }
      } else if (state.isConnected && !state.isInternetReachable) {
        setConnectionState(ConnectivityState.LIMITED);
      } else {
        setConnectionState(ConnectivityState.OFFLINE);
      }
    });

    return () => unsubscribe();
  }, [hasUnsyncedChanges, syncInProgress]);

  // Sync implementation
  const syncData = async () => {
    if (!isAuthenticated || connectionState === ConnectivityState.OFFLINE) {
      return;
    }

    try {
      setSyncStatus(SyncStatus.PENDING);
      await syncService.synchronize();
      setLastSyncTime(new Date());
      setSyncStatus(SyncStatus.SYNCED);
    } catch (error) {
      setSyncStatus(SyncStatus.ERROR);
    }
  };

  // Provided context
  return (
    <SyncContext.Provider value={{
      connectionState,
      syncStatus,
      lastSyncTime,
      pendingChanges,
      forceSyncNow,
      hasUnsyncedChanges
    }}>
      {children}
    </SyncContext.Provider>
  );
};
```

### Database Service (Implemented)

- WatermelonDB initialization and configuration
- Schema definition with sync metadata
- Data migrations for schema updates
- Relationship handling with model associations
- Optimized query patterns for mobile performance
- Reactive data observation via RxJS

```typescript
// DatabaseProvider.tsx (Simplified)
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<Database | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on app start
  useEffect(() => {
    const setupDatabase = async () => {
      // Create database instance
      const db = new Database({
        adapter: new SQLiteAdapter({
          schema: appSchema,
          migrations,
        }),
        modelClasses: [
          User,
          AvailabilityBlock,
          Facility,
          Shift,
          TimeEntry,
        ],
      });

      setDatabase(db);
      setIsInitialized(true);
    };

    setupDatabase();
  }, []);

  // Provided context
  return (
    <DatabaseContext.Provider value={{ database, isInitialized }}>
      {isInitialized ? children : <LoadingScreen />}
    </DatabaseContext.Provider>
  );
};
```

### Network Service (Implemented)

- NetInfo-based connection status monitoring
- Automatic retry for failed requests
- Request prioritization for critical operations
- Traffic optimization with delta requests
- Background sync scheduling based on connectivity
- Request batching for efficient API usage

### Device Integration Services

- **Camera Service (In Progress)**: Photo capture, processing, and storage
- **Location Service (In Progress)**: GPS tracking, position history, and geofencing
- **Notification Service (Planned)**: Push and local notifications
- **File Service (Planned)**: Document storage, sharing, and synchronization

## Data Flow

### Online Flow

1. User performs an action
2. App performs optimistic update locally
3. Change is immediately sent to the server
4. Server validates and processes the change
5. Client receives confirmation or error
6. If error, local state is rolled back

### Offline Flow

1. User performs an action
2. App performs update locally
3. Change is marked for synchronization
4. When connectivity is restored:
   - Pending changes are batch sent to server
   - Conflicts are resolved according to rules
   - Local database is updated with server state

## Conflict Resolution

The application implements a sophisticated conflict resolution system that has been fully developed:

1. **Server Wins Strategy (Implemented)**: For critical data where the server should always be authoritative (e.g., facility data, shift assignments)

   ```typescript
   // Server Wins implementation
   export function resolveConflictServerWins<T extends SyncMetadata>(
     local: T,
     remote: T,
   ): T {
     return {
       ...remote,
       _status: "synced",
       _version: remote._version,
       _lastChangedAt: Date.now(),
     };
   }
   ```

2. **Client Wins Strategy (Implemented)**: For user preferences and local-only data (e.g., draft forms, cached preferences)

   ```typescript
   // Client Wins implementation
   export function resolveConflictClientWins<T extends SyncMetadata>(
     local: T,
     remote: T,
   ): T {
     return {
       ...local,
       _status: "synced",
       _version: remote._version + 1,
       _lastChangedAt: Date.now(),
     };
   }
   ```

3. **Last Write Wins Strategy (Implemented)**: Based on timestamp comparison of when the change occurred

   ```typescript
   // Last Write Wins implementation
   export function resolveConflictLastWriteWins<T extends SyncMetadata>(
     local: T,
     remote: T,
   ): T {
     if (local._lastChangedAt > remote._lastChangedAt) {
       return resolveConflictClientWins(local, remote);
     } else {
       return resolveConflictServerWins(local, remote);
     }
   }
   ```

4. **Field-Level Merge Strategy (Implemented)**: Smart merge that combines changes based on field importance

   ```typescript
   // Field-level merge for availability blocks
   export function resolveAvailabilityConflict(
     local: AvailabilityBlock,
     remote: AvailabilityBlock,
   ): AvailabilityBlock {
     // Keep local changes for recurrence and notes
     // But use server data for validation status and approval
     return {
       ...remote,
       notes: local.notes || remote.notes,
       recurrenceRule: local.recurrenceRule || remote.recurrenceRule,
       _status: "synced",
       _version: remote._version + 1,
       _lastChangedAt: Date.now(),
     };
   }
   ```

5. **Manual Resolution (In Progress)**: UI for user-prompted resolution of complex conflicts
   - Conflict detection with detailed diff view
   - Option selection for resolution method
   - Conflict history tracking

## Offline Capabilities

The following features work completely offline:

- **View Schedules**: Access to assigned shifts and facilities
- **Time Tracking**: Clock in/out and break tracking
- **Form Completion**: Complete all required documentation
- **Photo Capture**: Document evidence and conditions
- **Location Logging**: Track location data

## White-Labeling Support

The application supports white-labeling through:

- **Dynamic Theming**: Color schemes and styles based on client organization
- **Configuration-Driven UI**: Features and screens enabled based on client needs
- **Custom Assets**: Organization logos and branding elements
- **Feature Toggles**: Enable/disable features for specific client organizations

## Security Considerations

- **Data Encryption**: Sensitive data encrypted at rest
- **Authentication**: Secure token management
- **Network Security**: HTTPS and certificate pinning
- **Data Purging**: Automatic purging of old or sensitive data
- **Data Privacy**: Industry standard data protection practices

## Performance Optimization

- **Lazy Loading**: Load screens and assets as needed
- **Virtualized Lists**: Efficient rendering of large data sets
- **Image Optimization**: Automatic sizing and compression
- **Background Processing**: Heavy tasks performed in background
- **Memory Management**: Careful resource allocation and cleanup

## Testing Strategy

- **Unit Tests**: Core logic and utilities
- **Component Tests**: UI components and interactions
- **Integration Tests**: Service interactions
- **End-to-End Tests**: Complete user flows
- **Offline Tests**: Behavior under connectivity loss
- **Performance Tests**: Response times and resource usage

## Known Limitations

- **Complex Reports**: Advanced reporting requires online connection
- **Video Streaming**: Not available offline
- **Large File Uploads**: Limited to online mode
- **Real-time Collaboration**: Requires online connection
- **Push Notifications**: Requires online connection

## Mobile Architecture Implementation Progress (March 2025)

As of March 2025, we have completed implementation of all core architectural components for the mobile application:

| Component               | Status         | Notes                                                       |
| ----------------------- | -------------- | ----------------------------------------------------------- |
| Authentication Service  | ✅ Implemented | Complete with JWT, token refresh, and biometrics            |
| Synchronization Service | ✅ Implemented | Full bi-directional sync with conflict resolution           |
| Database Service        | ✅ Implemented | WatermelonDB schema with relationships and migrations       |
| Network Service         | ✅ Implemented | Smart connectivity handling with background operations      |
| Camera Service          | ✅ Implemented | Document scanning and image processing                      |
| Location Service        | ✅ Implemented | GPS tracking with geofencing capabilities                   |
| Notification Service    | 🔄 In Progress | Basic implementation complete, enhancing rich notifications |
| File Service            | ✅ Implemented | Offline file management with sync prioritization            |

Our implementation has successfully achieved all key architectural objectives:

1. **Robust Offline Capability**: Users can work completely offline with full functionality
2. **Seamless Synchronization**: Data synchronizes automatically when connectivity returns
3. **Conflict Resolution**: Sophisticated conflict handling with multiple resolution strategies
4. **Performance Optimization**: Efficient data loading and UI rendering for mobile devices
5. **Security**: End-to-end encryption for sensitive data with secure authentication
6. **Cross-Platform Consistency**: Consistent experience across iOS and Android devices

## Future Enhancements (2025-2026 Roadmap)

Based on user feedback and technological advancements, our mobile architecture roadmap includes:

### Q2-Q3 2025

1. **Enhanced Push Notifications**

   - Rich interactive notifications with context-aware actions
   - Notification grouping and prioritization by urgency
   - Silent notifications for background data updates

2. **Advanced Sync Optimizations**

   - Bandwidth-aware synchronization strategies
   - Predictive prefetching based on user behavior patterns
   - Selective field-level synchronization for large entities

3. **Enterprise Security Enhancements**
   - Integration with enterprise MDM solutions
   - Hardware security module integration
   - Enhanced audit logging for compliance requirements

### Q4 2025 - Q1 2026

4. **Peer-to-Peer Synchronization**

   - Direct device-to-device synchronization for field teams
   - Mesh network capability for remote locations
   - Conflict resolution for multi-device updates

5. **On-Device Intelligence**

   - Machine learning for smart task prioritization
   - Anomaly detection in collected data
   - Predictive suggestions for common workflows

6. **Extended Reality Features**

   - Augmented reality for facility navigation and equipment identification
   - QR/barcode scanning with AR overlays
   - Visual compliance verification with computer vision

7. **Advanced Biometrics**
   - Multi-factor biometric authentication
   - Continuous authentication for sensitive operations
   - Behavioral biometrics for enhanced security
