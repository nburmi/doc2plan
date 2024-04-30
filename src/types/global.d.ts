declare global {
    type Plan = {
        name: string;
        chapters: Chapter[];
    }
    
    type Chapter = {
        id: number;
        name: string;
        topics: Topic[];
        done: boolean;
        keyTopics?: string;
    }
    
    type Topic = {
        id: number;
        title: string;
        path: string;
        children?: Topic[];
        parent_id ?: number;
        content?: string;
        quizes?: Quiz[];
        done: boolean;
    }
    
    type Quiz = {
        id: number;
        question: string;
        answer: string;
        done: boolean;
    }

    type OpenAI = {
        apiKey: string;
        assistantId: string;
        fileId: string;
        vectorStoreId: string;
        threadId: string;
    }
}

export {};