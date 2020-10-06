"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    constructor() {
        this.tasks = [];
        this.count = 1;
    }
    sched() {
        if (this.count > 0 && this.tasks.length > 0) {
            this.count--;
            let next = this.tasks.shift();
            next();
        }
    }
    get busy() {
        return this.count == 0;
    }
    acquire() {
        return new Promise(res => {
            let task = () => {
                let released = false;
                res(() => {
                    if (!released) {
                        released = true;
                        this.count++;
                        this.sched();
                    }
                });
            };
            this.tasks.push(task);
            process.nextTick(this.sched.bind(this));
        });
    }
    use(f) {
        return this.acquire()
            .then(release => f()
            .then(res => {
            release();
            return res;
        })
            .catch(err => {
            release();
            throw err;
        }));
    }
}
exports.Mutex = Mutex;
//# sourceMappingURL=mutex.js.map