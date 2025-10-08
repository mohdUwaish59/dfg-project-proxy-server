# Waiting Room Timer Requirements

## Introduction

This document outlines the requirements for implementing a 10-minute timer in the participant waiting room. The timer ensures that participants don't wait indefinitely for a group to form and provides a clear timeout mechanism for experiment sessions.

## Requirements

### Requirement 1: Timer Initialization

**User Story:** As a system, I want to start a 10-minute countdown when the first participant joins a waiting room, so that the session has a defined time limit.

#### Acceptance Criteria

1. WHEN the first participant joins an empty waiting room THEN the system SHALL start a 10-minute countdown timer
2. WHEN subsequent participants join the same waiting room THEN the system SHALL continue using the same timer started by the first participant
3. WHEN a waiting room already has an active timer THEN new participants SHALL see the remaining time from the existing timer
4. WHEN the timer reaches zero THEN the system SHALL automatically end the waiting room session

### Requirement 2: Timer Display

**User Story:** As a participant, I want to see how much time is remaining in the waiting room, so that I know how long I might need to wait.

#### Acceptance Criteria

1. WHEN a participant is in the waiting room THEN the system SHALL display the remaining time in MM:SS format
2. WHEN the timer has less than 1 minute remaining THEN the system SHALL highlight the timer in a warning color
3. WHEN the timer has less than 30 seconds remaining THEN the system SHALL display the timer in a critical/danger color
4. WHEN the timer updates THEN the system SHALL update the display in real-time without page refresh

### Requirement 3: Timer Expiration Handling

**User Story:** As a participant, I want to be notified when the waiting room timer expires, so that I understand why the session ended.

#### Acceptance Criteria

1. WHEN the timer reaches zero AND the group is not complete THEN the system SHALL display a timeout message to all participants
2. WHEN the timer expires THEN the system SHALL prevent new participants from joining the waiting room
3. WHEN the timer expires THEN the system SHALL update the link status to indicate the session has timed out
4. WHEN the timer expires THEN the system SHALL provide participants with instructions on what to do next

### Requirement 4: Timer Cancellation

**User Story:** As a system, I want to cancel the timer when the group becomes complete, so that successful groups are not affected by the timeout.

#### Acceptance Criteria

1. WHEN all required participants join before the timer expires THEN the system SHALL cancel the timer
2. WHEN the group becomes complete THEN the system SHALL proceed with normal redirection regardless of remaining time
3. WHEN the timer is cancelled due to group completion THEN the system SHALL not display timeout messages
4. WHEN the group completes THEN the system SHALL update the link status to "used" instead of "timed out"

### Requirement 5: Database Timer Management

**User Story:** As a system, I want to persist timer information in the database, so that timer state is maintained across server restarts and multiple participants.

#### Acceptance Criteria

1. WHEN a timer starts THEN the system SHALL store the start time in the database
2. WHEN participants check status THEN the system SHALL calculate remaining time based on stored start time
3. WHEN the server restarts THEN the system SHALL resume existing timers based on stored start times
4. WHEN a timer expires THEN the system SHALL update the database to reflect the timeout status

### Requirement 6: Admin Monitoring

**User Story:** As an administrator, I want to see timer information in the admin dashboard, so that I can monitor active waiting rooms and their time limits.

#### Acceptance Criteria

1. WHEN viewing the admin dashboard THEN the system SHALL display remaining time for active waiting rooms
2. WHEN a waiting room has an active timer THEN the system SHALL show the timer status in the links table
3. WHEN a waiting room times out THEN the system SHALL update the admin interface to show the timeout status
4. WHEN viewing statistics THEN the system SHALL include timeout events in the usage tracking