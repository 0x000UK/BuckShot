import mongoose from 'mongoose';

interface ICounter {
    id: string; // E.g., "userId"
    seq: number;
}

const CounterSchema = new mongoose.Schema<ICounter>({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const CounterModel = mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
export default CounterModel;
