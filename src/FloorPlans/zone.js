
export default class Zone {
    adjacentZones; //List of connected zones
    zoneType; //Which room type fills the zone?
    spatialOffset; //[x,y,z]
    doorwaySide; //T=0,R=1,B=2,L=3; also tells us if it's horizontal or vertical
    id;

    constructor(id, spatialOffset, doorwaySide) {
        this.id = id;
        this.spatialOffset = spatialOffset;
        this.doorwaySide = doorwaySide;
    }

    updateAdjacencies(adjacent) {
        this.adjacentZones = adjacent;
    }

    assignType(type) {
        this.zoneType = type;
    }

    getType() {
        return this.zoneType;
    }
}
