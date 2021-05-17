export default class Event{
    eventResult;
    locObj;
    startKey;
    destinationKey;
    complete = false;

    constructor(app, prereqList, nextEventList, locObj, startKey, destinationKey) {
        this.app = app;
        this.prereqList = prereqList;
        this.nextEventList = nextEventList;
        this.start = locObj[startKey];
        this.destination = locObj[destinationKey];

        this.locObj = locObj;
        this.startKey = startKey;
        this.destinationKey = destinationKey;
    }

    runEvent() {
        if (!this.complete) {
            this.complete = true;

            let optimal = [-1, -1];
            let optimalNum = Infinity;
            for (let i = 0; i < this.start.length; i++) {
                for (let j = 0; j < this.destination.length; j++) {
                    let thisDist = this.measureDistance(this.start[i], this.destination[j])
                    if (thisDist < optimalNum) {
                        optimalNum = thisDist;
                        optimal = [i, j];
                    }
                }
            }

            this.locObj[this.startKey] = [this.start[optimal[0]]]
            this.locObj[this.destinationKey] = [this.destination[optimal[0]]]

            this.eventResult = optimalNum;
        }
        return this.eventResult;
    }


    measureDistance(s, d) {
        let startLoc = this.app.query.findNearestPoly(s, this.app.ext, this.app.filter);
        let endLoc = this.app.query.findNearestPoly(d, this.app.ext, this.app.filter);
        console.log(startLoc)
        console.log(endLoc)
        return this.app.query.findPath(startLoc.getNearestRef(), startLoc.getNearestPos(), endLoc.getNearestRef(), endLoc.getNearestPos(), this.app.filter);
    }

    prereqsComplete() {
        //return false if at least one prereq is not complete.
        return !this.prereqList.some(prereq => {
            !prereq.complete;
        })
    }
}
