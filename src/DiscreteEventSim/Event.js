export default class Event{
    eventResult;
    locObj;
    startKey;
    destinationKey;
    prereqList;
    nextEventList;
    name;
    complete = false;

    constructor(app, name, locObj, startKey, destinationKey) {
        this.app = app;
        this.name = name;
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
                    let path = this.getPath(this.start[i], this.destination[j])

                    let temp = [];
                    for (let i = 1; i <= path.refs.length; i+=2) {
                        temp.push(path.refs[i])
                    }
                    path.refs = temp;

                    let pointArr = [];
                    path.refs.forEach(ref => {
                        pointArr.push(this.app.query.closestPointOnPoly(ref, this.destination[j]).closest)
                    });
                    pointArr.push(this.start[i]);
                    

                    let dist = 0;
                    for (let i = 0; i < pointArr.length-1; i++) {
                        dist += this.euclideanDist(pointArr[i], pointArr[i+1])
                    }
                    if (dist < optimalNum) {
                        optimalNum = dist;
                        optimal = [i, j];
                    }
                }
            }

            this.locObj[this.startKey] = [this.start[optimal[0]]]
            this.locObj[this.destinationKey] = [this.destination[optimal[0]]]

            this.eventResult = optimalNum;
            // console.log(this.eventResult)
        }
        return this.eventResult;
    }

    euclideanDist(s, d) {
        let x = d[0] - s[0];
        let y = d[1] - s[1];
        let z = d[2] - s[2];
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
    }

    getPath(s, d) {
        let startLoc = this.app.query.findNearestPoly(s, this.app.ext, this.app.filter);
        let endLoc = this.app.query.findNearestPoly(d, this.app.ext, this.app.filter);
        return this.app.query.findPath(startLoc.getNearestRef(), endLoc.getNearestRef(), startLoc.getNearestPos(), endLoc.getNearestPos(), this.app.filter);
    }

    updateLists(pList, neList) {
        this.prereqList = pList;
        this.nextEventList = neList;
    }

    prereqsComplete() {
        //return false if at least one prereq is not complete.
        if (this.prereqList.length > 0) {
            return !this.prereqList.some(prereq => {
                !prereq.complete;
            })
        } else {
            return true;
        }
    }
}
