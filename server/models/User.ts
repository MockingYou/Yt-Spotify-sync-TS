import { Schema, model } from 'mongoose';

interface IUser {
    username: string;
    email: string;
    password: string;
}

const userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
});

export default model<IUser>("User", userSchema);
