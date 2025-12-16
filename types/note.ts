// types/note.ts
export interface Highlight {
    id: string;
    text: string;
    start: number;
    end: number;
    color: string;
  }
  
  export interface Note {
    id: string;
    title: string;
    content: string;
    userId: string;
    highlights?: Highlight[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateNoteInput {
    title: string;
    content: string;
  }
  
  export interface UpdateNoteInput extends Partial<CreateNoteInput> {
    highlights?: Highlight[];
  }
  
  export interface NoteFormData {
    title: string;
    content: string;
  }
  
  // برای انتخاب متن
  export interface TextSelection {
    text: string;
    start: number;
    end: number;
    range?: Range;
  }