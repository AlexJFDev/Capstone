export interface Workspace {
    name: string;
    description: string;
    color: string;
    items: string[]; // List of item IDs
}

export const workspaces: Record<string, Workspace> = {
    'w-1a2b3c4d-5e6f-7890-abcd-ef1234567890': {
        name: 'Frontend Development',
        description: 'All tasks related to the frontend UI and client-side logic',
        color: '#000000',
        items: [
            'i-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            'i-c3d4e5f6-a7b8-9012-cdef-123456789012',
        ],
    },
    'w-2b3c4d5e-6f7a-8901-bcde-f12345678901': {
        name: 'Backend Development',
        description: 'Server-side development including database and API work',
        color: '#FFFFFF',
        items: [
            'i-b2c3d4e5-f6a7-8901-bcde-f12345678901',
            'i-c3d4e5f6-a7b8-9012-cdef-123456789012',
            'i-e5f6a7b8-c9d0-1234-efab-345678901234',
        ],
    },
    'w-3c4d5e6f-7a8b-9012-cdef-123456789012': {
        name: 'DevOps',
        description: 'Deployment, infrastructure, and CI/CD pipeline tasks',
        color: '#1ABC9C',
        items: [
            'i-f6a7b8c9-d0e1-2345-fabc-456789012345',
        ],
    },
    'w-4d5e6f7a-8b9c-0123-defa-234567890123': {
        name: 'Quality Assurance',
        description: 'Testing, code review, and documentation tasks',
        color: '#2ECC71',
        items: [
            'i-d4e5f6a7-b8c9-0123-defa-234567890123',
            'i-e5f6a7b8-c9d0-1234-efab-345678901234',
        ],
    },
};