import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExpense extends Document {
  _id: Types.ObjectId;
  team: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>('Expense', expenseSchema);
