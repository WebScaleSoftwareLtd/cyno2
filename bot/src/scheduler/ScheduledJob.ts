export default abstract class ScheduledJob<T> {
    abstract toJson(): T;
    abstract run(): Promise<void>;
}
