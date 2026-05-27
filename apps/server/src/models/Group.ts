import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent {
  name: string;
  email: string;
  rollNumber: string;
}

export interface IGroup extends Document {
  name: string;
  subject: string;
  section: string;
  description: string;
  color: string;
  icon: string;
  students: IStudent[];
  assignedPapers: {
    assignmentId: mongoose.Types.ObjectId;
    assignedAt: Date;
    dueDate: Date;
    title: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    rollNumber: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const assignedPaperSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    assignedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    title: { type: String, required: true },
  },
  { _id: false }
);

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    subject: { type: String, trim: true, default: '' },
    section: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '', maxlength: 500 },
    color: { type: String, default: '#7C3AED' },
    icon: { type: String, default: '🏫' },
    students: { type: [studentSchema], default: [] },
    assignedPapers: { type: [assignedPaperSchema], default: [] },
  },
  { timestamps: true }
);

groupSchema.index({ createdAt: -1 });

export const GroupModel = mongoose.model<IGroup>('Group', groupSchema);
