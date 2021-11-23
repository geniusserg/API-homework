import { ObjectId } from "mongodb";

export default class Game {
    constructor(public title: string, public description: string, public images: string[], public ageRating: string, public id?: ObjectId) {}
}
