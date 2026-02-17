export interface Item {
    name: string;
    description: string;
    'start-date': string;
    'end-date': string;
    color: string;
}

export const items: Record<string, Item> = {
    'i-a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
        name: 'Design Homepage',
        description: 'Create wireframes and mockups for the homepage layout',
        'start-date': '2026-02-17T00:00:00Z',
        'end-date': '2026-02-24T00:00:00Z',
        color: '#4A90D9',
    },
    'i-b2c3d4e5-f6a7-8901-bcde-f12345678901': {
        name: 'Set Up Database',
        description: 'Initialize the database schema and configure connections',
        'start-date': '2026-02-18T00:00:00Z',
        'end-date': '2026-02-22T00:00:00Z',
        color: '#7B61FF',
    },
    'i-c3d4e5f6-a7b8-9012-cdef-123456789012': {
        name: 'User Authentication',
        description: 'Implement login, registration, and session management',
        'start-date': '2026-02-20T00:00:00Z',
        'end-date': '2026-03-05T00:00:00Z',
        color: '#E74C3C',
    },
    'i-d4e5f6a7-b8c9-0123-defa-234567890123': {
        name: 'Write Unit Tests',
        description: 'Add unit tests for core utility functions',
        'start-date': '2026-02-22T00:00:00Z',
        'end-date': '2026-03-01T00:00:00Z',
        color: '#2ECC71',
    },
    'i-e5f6a7b8-c9d0-1234-efab-345678901234': {
        name: 'API Documentation',
        description: 'Document all REST API endpoints with examples',
        'start-date': '2026-03-01T00:00:00Z',
        'end-date': '2026-03-10T00:00:00Z',
        color: '#F39C12',
    },
    'i-f6a7b8c9-d0e1-2345-fabc-456789012345': {
        name: 'Deploy to Staging',
        description: 'Configure CI/CD pipeline and deploy to the staging environment',
        'start-date': '2026-03-05T00:00:00Z',
        'end-date': '2026-03-12T00:00:00Z',
        color: '#1ABC9C',
    },
};